# Banco SmartLar

Rode no SQL Editor do Supabase, nesta ordem, em um projeto vazio:

1. [migrations/0001_schema.sql](migrations/0001_schema.sql) — tabelas, enums e índices
2. [migrations/0002_functions.sql](migrations/0002_functions.sql) — total do pedido, fluxo de status, histórico, views e RPCs
3. [migrations/0003_rls.sql](migrations/0003_rls.sql) — Row Level Security
4. [migrations/0004_instalacoes_amanha_email.sql](migrations/0004_instalacoes_amanha_email.sql) — e-mail do cliente na agenda de amanhã
5. [migrations/0005_webhooks_n8n.sql](migrations/0005_webhooks_n8n.sql) — avisos de pedido novo e pedido concluído
6. [migrations/0006_relatorios.sql](migrations/0006_relatorios.sql) — views de faturamento, status, produtos e equipe
7. [migrations/0007_desconto.sql](migrations/0007_desconto.sql) — desconto no orçamento
8. [migrations/0008_conflito_agenda.sql](migrations/0008_conflito_agenda.sql) — técnico sem dois horários colados
9. [migrations/0009_orcamentos_parados.sql](migrations/0009_orcamentos_parados.sql) — orçamentos parados para o n8n
10. [seed.sql](seed.sql) — clientes, técnicos, produtos e pedidos de exemplo
11. [seed_historico.sql](seed_historico.sql) — concluídos dos meses anteriores, para o gráfico

Depois crie um usuário em Authentication > Users (e-mail e senha). O frontend não tem cadastro público: só entra quem já existe no Auth.

A chave usada no frontend é a `anon`. A `service_role` fica só no n8n.
