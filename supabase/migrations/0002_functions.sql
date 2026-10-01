-- SmartLar — regras de negócio, cálculos, histórico, views e RPCs.
-- Depende de 0001_schema.sql.

-- Recalcula valor_total a partir dos subtotais. Única escrita permitida nessa coluna.
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
  set valor_total = coalesce((
        select sum(subtotal)
        from public.itens_pedido
        where pedido_id = v_pedido_id
      ), 0),
      updated_at = now()
  where id = v_pedido_id;

  return null;
end;
$$;

drop trigger if exists trg_recalcular_valor_pedido on public.itens_pedido;
create trigger trg_recalcular_valor_pedido
after insert or update or delete on public.itens_pedido
for each row
execute function public.recalcular_valor_pedido();

-- Itens só mudam enquanto o pedido é orçamento.
create or replace function public.bloquear_itens_fora_orcamento()
returns trigger
language plpgsql
as $$
declare
  v_status public.status_pedido;
  v_pedido uuid;
begin
  v_pedido := coalesce(new.pedido_id, old.pedido_id);
  select status into v_status
  from public.pedidos
  where id = v_pedido;

  if v_status is distinct from 'orcamento' then
    raise exception 'Itens só podem ser alterados enquanto o pedido está em orçamento (status atual: %)', v_status
      using errcode = '23514';
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_bloquear_itens on public.itens_pedido;
create trigger trg_bloquear_itens
before insert or update or delete on public.itens_pedido
for each row
execute function public.bloquear_itens_fora_orcamento();

-- O preço do item é sempre o do catálogo na inclusão e não muda depois (snapshot).
create or replace function public.snapshot_preco_item()
returns trigger
language plpgsql
as $$
declare
  v_preco numeric(10, 2);
begin
  if tg_op = 'UPDATE' then
    new.preco_unitario := old.preco_unitario;
    new.produto_id := old.produto_id;
    new.pedido_id := old.pedido_id;
    return new;
  end if;

  select preco_unitario into v_preco
  from public.produtos
  where id = new.produto_id
    and ativo = true;

  if v_preco is null then
    raise exception 'Produto inválido ou inativo' using errcode = '23514';
  end if;

  new.preco_unitario := v_preco;
  return new;
end;
$$;

drop trigger if exists trg_snapshot_preco_item on public.itens_pedido;
create trigger trg_snapshot_preco_item
before insert or update on public.itens_pedido
for each row
execute function public.snapshot_preco_item();

-- Transições permitidas. Não volta e não pula etapa.
-- orcamento -> aprovado | cancelado
-- aprovado  -> agendado | cancelado
-- agendado  -> em_andamento
-- em_andamento -> concluido
create or replace function public.validar_pedido_update()
returns trigger
language plpgsql
as $$
declare
  v_itens integer;
begin
  if current_setting('smartlar.recalc', true) = '1' then
    return new;
  end if;

  -- valor_total só muda pelo trigger de recálculo. numero é identity.
  new.valor_total := old.valor_total;
  new.created_at := old.created_at;
  new.cliente_id := old.cliente_id;

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
     )
     and new.status is not distinct from old.status then
    raise exception 'Pedido % não pode mais ser editado', new.status
      using errcode = '23514';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_validar_pedido_update on public.pedidos;
create trigger trg_validar_pedido_update
before update on public.pedidos
for each row
execute function public.validar_pedido_update();

create or replace function public.registrar_historico_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.historico_status (pedido_id, status_anterior, status_novo)
    values (new.id, null, new.status);
  elsif new.status is distinct from old.status then
    insert into public.historico_status (pedido_id, status_anterior, status_novo)
    values (new.id, old.status, new.status);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_historico_insert on public.pedidos;
create trigger trg_historico_insert
after insert on public.pedidos
for each row
execute function public.registrar_historico_status();

drop trigger if exists trg_historico_update on public.pedidos;
create trigger trg_historico_update
after update of status on public.pedidos
for each row
when (old.status is distinct from new.status)
execute function public.registrar_historico_status();

-- Cria o pedido e os itens na mesma transação. O preço do item é o do catálogo.
create or replace function public.criar_pedido(
  p_cliente_id uuid,
  p_observacoes text,
  p_forma_pagamento public.forma_pagamento,
  p_itens jsonb
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

  insert into public.pedidos (cliente_id, observacoes, forma_pagamento, status)
  values (p_cliente_id, nullif(trim(p_observacoes), ''), p_forma_pagamento, 'orcamento')
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

create or replace function public.inicio_do_mes_sp()
returns timestamptz
language sql
stable
as $$
  select date_trunc('month', now() at time zone 'America/Sao_Paulo')
         at time zone 'America/Sao_Paulo';
$$;

create or replace function public.inicio_do_dia_sp(p_offset_days integer default 0)
returns timestamptz
language sql
stable
as $$
  select (date_trunc('day', now() at time zone 'America/Sao_Paulo')
          + make_interval(days => p_offset_days))
         at time zone 'America/Sao_Paulo';
$$;

create or replace view public.vw_dashboard_kpis
with (security_invoker = true) as
select
  (
    select count(*)::integer
    from public.pedidos
    where created_at >= public.inicio_do_mes_sp()
  ) as pedidos_mes,
  (
    select coalesce(sum(valor_total), 0)
    from public.pedidos
    where status = 'concluido'
      and coalesce(concluido_em, updated_at) >= public.inicio_do_mes_sp()
  ) as valor_faturado,
  (
    select coalesce(sum(valor_total), 0)
    from public.pedidos
    where status in ('aprovado', 'agendado', 'em_andamento')
  ) as valor_a_receber,
  (
    select count(*)::integer
    from public.pedidos
    where status = 'aprovado'
  ) as pendentes_agendamento;

comment on view public.vw_dashboard_kpis is
  'KPIs do Rafael. Faturado = concluídos no mês corrente (America/Sao_Paulo). A receber = aprovados + agendados + em andamento, independente do mês. Pendentes de agendamento = status aprovado.';

create or replace view public.vw_proximas_instalacoes
with (security_invoker = true) as
select
  p.id,
  p.numero,
  p.data_instalacao,
  p.status,
  p.valor_total,
  c.nome as cliente_nome,
  c.endereco,
  c.telefone as cliente_telefone,
  t.id as tecnico_id,
  t.nome as tecnico_nome
from public.pedidos p
join public.clientes c on c.id = p.cliente_id
left join public.tecnicos t on t.id = p.tecnico_id
where p.status in ('agendado', 'em_andamento')
  and p.data_instalacao >= public.inicio_do_dia_sp(0)
  and p.data_instalacao < public.inicio_do_dia_sp(7)
order by p.data_instalacao;

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
  t.nome as tecnico_nome
from public.pedidos p
join public.clientes c on c.id = p.cliente_id
left join public.tecnicos t on t.id = p.tecnico_id;

-- Usada pela Automação 2 do n8n. Instalações de amanhã no fuso de São Paulo.
create or replace function public.instalacoes_amanha()
returns table (
  pedido_id uuid,
  numero integer,
  cliente_nome text,
  endereco text,
  tecnico_nome text,
  data_instalacao timestamptz,
  status public.status_pedido
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.numero,
    c.nome,
    c.endereco,
    t.nome,
    p.data_instalacao,
    p.status
  from public.pedidos p
  join public.clientes c on c.id = p.cliente_id
  left join public.tecnicos t on t.id = p.tecnico_id
  where p.status in ('agendado', 'em_andamento')
    and (p.data_instalacao at time zone 'America/Sao_Paulo')::date
      = ((now() at time zone 'America/Sao_Paulo')::date + 1)
  order by p.data_instalacao;
$$;

grant execute on function public.criar_pedido(uuid, text, public.forma_pagamento, jsonb) to authenticated;
grant execute on function public.instalacoes_amanha() to authenticated, service_role;
