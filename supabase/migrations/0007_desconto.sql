-- Desconto em reais, só enquanto o pedido é orçamento.
-- valor_total = soma dos subtotais - desconto, nunca negativo.
-- Com desconto 0 o total continua a soma dos itens (2 x 450 + 180 = 1080).

alter table public.pedidos
  add column if not exists desconto numeric(12, 2) not null default 0;

do $$
begin
  alter table public.pedidos
    add constraint pedidos_desconto_nao_negativo check (desconto >= 0);
exception
  when duplicate_object then null;
end $$;

comment on column public.pedidos.desconto is
  'Desconto em reais. Só muda em orçamento. O valor_total é a soma dos itens menos este valor, nunca negativo.';

comment on column public.pedidos.valor_total is
  'Soma dos subtotais menos o desconto, nunca negativo. Recalculado por trigger; não deve ser editado manualmente.';

create or replace function public.recalcular_valor_pedido()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pedido_id uuid;
begin
  v_pedido_id := coalesce(new.pedido_id, old.pedido_id);
  perform set_config('smartlar.recalc', '1', true);

  update public.pedidos
  set valor_total = greatest(
        coalesce((
          select sum(subtotal)
          from public.itens_pedido
          where pedido_id = v_pedido_id
        ), 0) - desconto,
        0
      ),
      updated_at = now()
  where id = v_pedido_id;

  return null;
end;
$$;

create or replace function public.validar_pedido_update()
returns trigger
language plpgsql
as $$
declare
  v_itens integer;
  v_subtotal numeric(12, 2);
begin
  if current_setting('smartlar.recalc', true) = '1' then
    return new;
  end if;

  new.valor_total := old.valor_total;
  new.created_at := old.created_at;
  new.cliente_id := old.cliente_id;

  if new.desconto is distinct from old.desconto then
    if old.status <> 'orcamento' then
      raise exception 'Desconto só pode ser alterado enquanto o pedido está em orçamento'
        using errcode = '23514';
    end if;

    select coalesce(sum(subtotal), 0) into v_subtotal
    from public.itens_pedido
    where pedido_id = new.id;

    new.valor_total := greatest(v_subtotal - new.desconto, 0);
  end if;

  if new.tecnico_id is distinct from old.tecnico_id and new.tecnico_id is not null then
    if not exists (
      select 1 from public.tecnicos
      where id = new.tecnico_id and ativo = true
    ) then
      raise exception 'Técnico inválido ou inativo' using errcode = '23514';
    end if;
  end if;

  if new.status is distinct from old.status then
    if not (
      (old.status = 'orcamento' and new.status in ('aprovado', 'cancelado'))
      or (old.status = 'aprovado' and new.status in ('agendado', 'cancelado'))
      or (old.status = 'agendado' and new.status = 'em_andamento')
      or (old.status = 'em_andamento' and new.status = 'concluido')
    ) then
      raise exception 'Transição de status inválida: % → %. O fluxo é orçamento, aprovado, agendado, em andamento e concluído. Cancelar só é permitido a partir de orçamento ou aprovado.',
        old.status, new.status
        using errcode = '23514';
    end if;

    select count(*) into v_itens
    from public.itens_pedido
    where pedido_id = new.id;

    if new.status <> 'cancelado' and v_itens = 0 then
      raise exception 'Pedido sem itens não pode avançar de status'
        using errcode = '23514';
    end if;

    if new.status = 'concluido' and new.concluido_em is null then
      new.concluido_em := now();
    end if;
  end if;

  if new.status in ('agendado', 'em_andamento', 'concluido') then
    if new.tecnico_id is null or new.data_instalacao is null then
      raise exception 'Para agendar (e nos status seguintes) informe o técnico e a data de instalação'
        using errcode = '23514';
    end if;
  end if;

  if new.status in ('concluido', 'cancelado')
     and (
       new.tecnico_id is distinct from old.tecnico_id
       or new.data_instalacao is distinct from old.data_instalacao
       or new.observacoes is distinct from old.observacoes
       or new.forma_pagamento is distinct from old.forma_pagamento
       or new.desconto is distinct from old.desconto
     )
     and new.status is not distinct from old.status then
    raise exception 'Pedido % não pode mais ser editado', new.status
      using errcode = '23514';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop function if exists public.criar_pedido(uuid, text, public.forma_pagamento, jsonb);

create or replace function public.criar_pedido(
  p_cliente_id uuid,
  p_observacoes text,
  p_forma_pagamento public.forma_pagamento,
  p_itens jsonb,
  p_desconto numeric default 0
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pedido_id uuid;
  v_item jsonb;
  v_produto_id uuid;
  v_qtd integer;
  v_preco numeric(10, 2);
begin
  if p_cliente_id is null then
    raise exception 'Selecione um cliente' using errcode = '23514';
  end if;

  if not exists (select 1 from public.clientes where id = p_cliente_id) then
    raise exception 'Cliente não encontrado' using errcode = '23514';
  end if;

  if p_itens is null or jsonb_typeof(p_itens) <> 'array' or jsonb_array_length(p_itens) = 0 then
    raise exception 'O pedido precisa ter pelo menos um produto' using errcode = '23514';
  end if;

  if p_desconto is null or p_desconto < 0 then
    raise exception 'Desconto não pode ser negativo' using errcode = '23514';
  end if;

  insert into public.pedidos (cliente_id, observacoes, forma_pagamento, status, desconto)
  values (
    p_cliente_id,
    nullif(trim(p_observacoes), ''),
    p_forma_pagamento,
    'orcamento',
    p_desconto
  )
  returning id into v_pedido_id;

  for v_item in
    select value from jsonb_array_elements(p_itens)
  loop
    v_produto_id := (v_item ->> 'produto_id')::uuid;
    v_qtd := (v_item ->> 'quantidade')::integer;

    if v_qtd is null or v_qtd <= 0 then
      raise exception 'Quantidade inválida' using errcode = '23514';
    end if;

    select preco_unitario into v_preco
    from public.produtos
    where id = v_produto_id
      and ativo = true;

    if v_preco is null then
      raise exception 'Produto inválido ou inativo' using errcode = '23514';
    end if;

    insert into public.itens_pedido (pedido_id, produto_id, quantidade, preco_unitario)
    values (v_pedido_id, v_produto_id, v_qtd, v_preco);
  end loop;

  return v_pedido_id;
end;
$$;

revoke all on function public.criar_pedido(uuid, text, public.forma_pagamento, jsonb, numeric) from public, anon;
grant execute on function public.criar_pedido(uuid, text, public.forma_pagamento, jsonb, numeric) to authenticated;

create or replace view public.vw_pedidos_resumo
with (security_invoker = true) as
select
  p.id,
  p.numero,
  p.cliente_id,
  p.tecnico_id,
  p.status,
  p.data_instalacao,
  p.valor_total,
  p.forma_pagamento,
  p.observacoes,
  p.created_at,
  p.updated_at,
  p.concluido_em,
  c.nome as cliente_nome,
  c.telefone as cliente_telefone,
  c.endereco as cliente_endereco,
  t.nome as tecnico_nome,
  p.desconto
from public.pedidos p
join public.clientes c on c.id = p.cliente_id
left join public.tecnicos t on t.id = p.tecnico_id;

create or replace view public.vw_conversao
with (security_invoker = true) as
select
  count(*)::integer as total_pedidos,
  count(*) filter (
    where status not in ('orcamento', 'cancelado')
  )::integer as convertidos,
  case
    when count(*) = 0 then 0
    else round(
      100.0 * count(*) filter (where status not in ('orcamento', 'cancelado')) / count(*),
      1
    )
  end as taxa_percentual,
  coalesce(avg(valor_total) filter (where status = 'concluido'), 0) as ticket_medio,
  coalesce(sum(desconto), 0) as total_descontado
from public.pedidos;

grant select on public.vw_pedidos_resumo to authenticated;
grant select on public.vw_conversao to authenticated;
