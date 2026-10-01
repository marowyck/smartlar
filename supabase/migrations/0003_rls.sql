-- SmartLar — Row Level Security.
-- O app é interno: qualquer usuário autenticado (Rafael e a equipe) opera o sistema.
-- anon não lê nem escreve. historico_status só é gravado pelos triggers.
-- Depende de 0001 e 0002.

alter table public.clientes enable row level security;
alter table public.tecnicos enable row level security;
alter table public.produtos enable row level security;
alter table public.pedidos enable row level security;
alter table public.itens_pedido enable row level security;
alter table public.historico_status enable row level security;

drop policy if exists clientes_authenticated_all on public.clientes;
create policy clientes_authenticated_all
on public.clientes
for all
to authenticated
using (true)
with check (true);

drop policy if exists tecnicos_authenticated_all on public.tecnicos;
create policy tecnicos_authenticated_all
on public.tecnicos
for all
to authenticated
using (true)
with check (true);

drop policy if exists produtos_authenticated_all on public.produtos;
create policy produtos_authenticated_all
on public.produtos
for all
to authenticated
using (true)
with check (true);

drop policy if exists pedidos_authenticated_all on public.pedidos;
create policy pedidos_authenticated_all
on public.pedidos
for all
to authenticated
using (true)
with check (true);

drop policy if exists itens_authenticated_all on public.itens_pedido;
create policy itens_authenticated_all
on public.itens_pedido
for all
to authenticated
using (true)
with check (true);

drop policy if exists historico_authenticated_select on public.historico_status;
create policy historico_authenticated_select
on public.historico_status
for select
to authenticated
using (true);

revoke all on table public.clientes from anon;
revoke all on table public.tecnicos from anon;
revoke all on table public.produtos from anon;
revoke all on table public.pedidos from anon;
revoke all on table public.itens_pedido from anon;
revoke all on table public.historico_status from anon, authenticated;

grant select, insert, update, delete on public.clientes to authenticated;
grant select, insert, update, delete on public.tecnicos to authenticated;
grant select, insert, update, delete on public.produtos to authenticated;
grant select, insert, update, delete on public.pedidos to authenticated;
grant select, insert, update, delete on public.itens_pedido to authenticated;
grant select on public.historico_status to authenticated;

grant select on public.vw_dashboard_kpis to authenticated;
grant select on public.vw_proximas_instalacoes to authenticated;
grant select on public.vw_pedidos_resumo to authenticated;

revoke all on public.vw_dashboard_kpis from anon;
revoke all on public.vw_proximas_instalacoes from anon;
revoke all on public.vw_pedidos_resumo from anon;

revoke all on function public.criar_pedido(uuid, text, public.forma_pagamento, jsonb) from public, anon;
grant execute on function public.criar_pedido(uuid, text, public.forma_pagamento, jsonb) to authenticated;

revoke all on function public.instalacoes_amanha() from public, anon;
grant execute on function public.instalacoes_amanha() to authenticated, service_role;

grant execute on function public.inicio_do_mes_sp() to authenticated;
grant execute on function public.inicio_do_dia_sp(integer) to authenticated;

grant usage, select on all sequences in schema public to authenticated;
