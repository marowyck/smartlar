-- O mesmo técnico não pode ter duas instalações (agendada ou em andamento)
-- com menos de 2 horas de diferença.

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

  if new.status in ('agendado', 'em_andamento')
     and new.tecnico_id is not null
     and new.data_instalacao is not null
     and (
       new.status is distinct from old.status
       or new.tecnico_id is distinct from old.tecnico_id
       or new.data_instalacao is distinct from old.data_instalacao
     )
     and exists (
       select 1
       from public.pedidos outro
       where outro.id <> new.id
         and outro.tecnico_id = new.tecnico_id
         and outro.status in ('agendado', 'em_andamento')
         and outro.data_instalacao is not null
         and abs(extract(epoch from (outro.data_instalacao - new.data_instalacao))) < 7200
     )
  then
    raise exception 'Esse técnico já tem instalação a menos de 2 horas desse horário'
      using errcode = '23514';
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
