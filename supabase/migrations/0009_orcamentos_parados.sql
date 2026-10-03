-- Orçamentos parados há pelo menos p_dias dias. A automação 4 do n8n chama esta função.
-- Cliente sem e-mail volta na lista com cliente_email nulo; o workflow é quem interrompe.

create or replace function public.orcamentos_parados(p_dias integer default 3)
returns table (
  pedido_id uuid,
  numero integer,
  cliente_nome text,
  cliente_email text,
  valor_total numeric,
  dias_parado integer,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if p_dias is null or p_dias < 1 then
    raise exception 'Informe pelo menos 1 dia' using errcode = '23514';
  end if;

  return query
  select
    p.id,
    p.numero,
    c.nome,
    nullif(btrim(c.email), ''),
    p.valor_total,
    floor(extract(epoch from (now() - p.created_at)) / 86400)::integer,
    p.created_at
  from public.pedidos p
  join public.clientes c on c.id = p.cliente_id
  where p.status = 'orcamento'
    and p.created_at <= now() - make_interval(days => p_dias)
  order by p.created_at;
end;
$$;

comment on function public.orcamentos_parados(integer) is
  'Orçamentos criados há pelo menos p_dias dias. Usada pelo lembrete diário do n8n.';

revoke all on function public.orcamentos_parados(integer) from public, anon;
grant execute on function public.orcamentos_parados(integer) to authenticated, service_role;
