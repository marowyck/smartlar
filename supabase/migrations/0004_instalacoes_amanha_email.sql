-- A automação de amanhã envia para o e-mail do cliente do pedido.
-- Trocar o tipo de retorno exige recriar a função.

drop function if exists public.instalacoes_amanha();

create function public.instalacoes_amanha()
returns table (
  pedido_id uuid,
  numero integer,
  cliente_nome text,
  cliente_email text,
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
    c.email,
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

revoke all on function public.instalacoes_amanha() from public, anon;
grant execute on function public.instalacoes_amanha() to authenticated, service_role;

comment on function public.instalacoes_amanha() is
  'Instalações de amanhã no fuso de São Paulo, com o e-mail do cliente para o n8n.';
