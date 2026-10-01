# Banco SmartLar

Rode no SQL Editor do Supabase, nesta ordem, em um projeto vazio:

1. [migrations/0001_schema.sql](migrations/0001_schema.sql) — tabelas, enums e índices
2. [migrations/0002_functions.sql](migrations/0002_functions.sql) — total do pedido, fluxo de status, histórico, views e RPCs
3. [migrations/0003_rls.sql](migrations/0003_rls.sql) — Row Level Security
4. [seed.sql](seed.sql) — clientes, técnicos, produtos e pedidos de exemplo

Depois crie um usuário em Authentication > Users (e-mail e senha). O frontend não tem cadastro público: só entra quem já existe no Auth.

A chave usada no frontend é a `anon`. A `service_role` fica só no n8n.
