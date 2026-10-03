-- Relatórios do Rafael. Views com security_invoker: o RLS das tabelas continua valendo.

create or replace view public.vw_faturamento_mensal
with (security_invoker = true) as
with meses as (
  select generate_series(
    date_trunc('month', (now() at time zone 'America/Sao_Paulo') - interval '5 months'),
    date_trunc('month', now() at time zone 'America/Sao_Paulo'),
    interval '1 month'
  )::date as mes
)
select
  m.mes,
  coalesce(sum(p.valor_total), 0) as valor_faturado,
  count(p.id)::integer as pedidos
from meses m
left join public.pedidos p
  on p.status = 'concluido'
 and date_trunc(
       'month',
       (coalesce(p.concluido_em, p.updated_at) at time zone 'America/Sao_Paulo')
     )::date = m.mes
group by m.mes
order by m.mes;

comment on view public.vw_faturamento_mensal is
  'Faturamento dos últimos 6 meses, pelo concluido_em em America/Sao_Paulo. Mês sem conclusão entra com zero.';

create or replace view public.vw_pedidos_por_status
with (security_invoker = true) as
select
  s.status,
  count(p.id)::integer as quantidade,
  coalesce(sum(p.valor_total), 0) as valor
from unnest(enum_range(null::public.status_pedido)) as s(status)
left join public.pedidos p on p.status = s.status
group by s.status
order by array_position(enum_range(null::public.status_pedido), s.status);

comment on view public.vw_pedidos_por_status is
  'Quantidade e valor de pedidos em cada status, inclusive os que estão em zero.';

create or replace view public.vw_produtos_vendidos
with (security_invoker = true) as
select
  pr.id,
  pr.nome,
  pr.categoria,
  coalesce(sum(i.quantidade) filter (where p.id is not null), 0)::integer as quantidade,
  coalesce(sum(i.subtotal) filter (where p.id is not null), 0) as receita
from public.produtos pr
left join public.itens_pedido i on i.produto_id = pr.id
left join public.pedidos p on p.id = i.pedido_id and p.status <> 'cancelado'
group by pr.id, pr.nome, pr.categoria
order by receita desc, pr.nome;

comment on view public.vw_produtos_vendidos is
  'Receita e quantidade por produto, sem contar pedidos cancelados.';

create or replace view public.vw_desempenho_tecnico
with (security_invoker = true) as
select
  t.id,
  t.nome,
  t.telefone,
  t.especialidade,
  t.ativo,
  count(p.id) filter (
    where p.status = 'concluido'
      and coalesce(p.concluido_em, p.updated_at) >= public.inicio_do_mes_sp()
  )::integer as concluidas_mes,
  coalesce(sum(p.valor_total) filter (
    where p.status = 'concluido'
      and coalesce(p.concluido_em, p.updated_at) >= public.inicio_do_mes_sp()
  ), 0) as faturado_mes,
  count(p.id) filter (
    where p.status in ('agendado', 'em_andamento')
      and p.data_instalacao >= public.inicio_do_dia_sp(0)
      and p.data_instalacao < public.inicio_do_dia_sp(7)
  )::integer as carga_semana,
  min(p.data_instalacao) filter (
    where p.status in ('agendado', 'em_andamento')
      and p.data_instalacao >= now()
  ) as proxima_instalacao
from public.tecnicos t
left join public.pedidos p on p.tecnico_id = t.id
group by t.id, t.nome, t.telefone, t.especialidade, t.ativo
order by t.nome;

comment on view public.vw_desempenho_tecnico is
  'Concluídas e faturado no mês, carga dos próximos 7 dias e próxima instalação de cada técnico.';

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
  coalesce(avg(valor_total) filter (where status = 'concluido'), 0) as ticket_medio
from public.pedidos;

comment on view public.vw_conversao is
  'Conversão é o pedido que saiu de orçamento e não foi cancelado, sobre o total de pedidos. Ticket médio usa só concluídos.';

revoke all on public.vw_faturamento_mensal from anon, public;
revoke all on public.vw_pedidos_por_status from anon, public;
revoke all on public.vw_produtos_vendidos from anon, public;
revoke all on public.vw_desempenho_tecnico from anon, public;
revoke all on public.vw_conversao from anon, public;

grant select on public.vw_faturamento_mensal to authenticated;
grant select on public.vw_pedidos_por_status to authenticated;
grant select on public.vw_produtos_vendidos to authenticated;
grant select on public.vw_desempenho_tecnico to authenticated;
grant select on public.vw_conversao to authenticated;
