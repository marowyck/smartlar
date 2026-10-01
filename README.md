# SmartLar

Sistema para o Rafael controlar orçamentos, instalações e o que ainda tem a receber. Os técnicos Lucas e Pedro consultam a agenda deles e atualizam o status do serviço.

## Telas

- Dashboard: pedidos do mês, faturado, a receber, pendentes de agenda, próximas instalações e orçamentos parados
- Clientes: cadastro, busca por nome ou telefone e pedidos do cliente
- Produtos: catálogo por categoria, produto novo e edição de preço
- Novo pedido: cliente (ou cadastro na hora), vários itens, subtotal, total e gravação como orçamento
- Pedidos: filtro por status, detalhe, avanço do fluxo e agendamento com técnico e data obrigatórios
- Agenda: instalações por técnico, com botões para em andamento e concluído
- Login com Supabase Auth

## Subir o banco

No SQL Editor do Supabase, rode em ordem:

1. `supabase/migrations/0001_schema.sql`
2. `supabase/migrations/0002_functions.sql`
3. `supabase/migrations/0003_rls.sql`
4. `supabase/seed.sql`

Crie um usuário em Authentication. Detalhes em [supabase/README.md](supabase/README.md).

## Subir o frontend

```bash
npm install
cp .env.example .env
```

Preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` com a chave anon.

```bash
npm run dev
npm run test
npm run build
```

Deploy na Vercel ou Netlify com as mesmas variáveis. Os arquivos `vercel.json` e `netlify.toml` já tratam o refresh das rotas.

## Automações

Importe os JSON de `n8n/` e siga [n8n/README.md](n8n/README.md). A `service_role` fica só no n8n.

## Documentos do teste

- [docs/ENTREGA.md](docs/ENTREGA.md) — o que enviar, decisões e o que falta preencher (links e prints)
- [docs/TESTE.md](docs/TESTE.md) — roteiro de um pedido até concluído, incluindo os R$ 1.080,00
