# SmartLar — documento de entrega

Sistema de gestão da SmartLar para o Rafael: clientes, catálogo, orçamentos, agenda dos técnicos e indicadores do mês. Frontend em Vite + React + shadcn/ui, banco no Supabase, automações no n8n.

## 1. Link do projeto funcionando

- Produção: `https://temporary-racing-harp-4wy8unc.vercel.app`
- Login de demonstração: `rafael@smartlar.dev` / `SmartLar-rafael-2026`
- Comando local: `npm install`, copiar `.env.example` para `.env`, `npm run dev`

## 2. Supabase

- Projeto: `https://supabase.com/dashboard/project/cpnsbtrlagsqemldzcif`

O que mostrar nos prints:

- Tabelas `clientes`, `tecnicos`, `produtos`, `pedidos`, `itens_pedido`, `historico_status`
- Diagrama ou colunas com as foreign keys (`cliente_id`, `tecnico_id`, `pedido_id`, `produto_id`)
- Dados do seed: 5 clientes, Lucas e Pedro, 7 produtos em 3 categorias, 11 pedidos
- Pedido da Elena Rocha com 2x Câmera IP + 1x Sensor de presença e `valor_total = 1080.00`

SQL, nesta ordem: `supabase/migrations/0001_schema.sql`, `0002_functions.sql`, `0003_rls.sql`, `0004_instalacoes_amanha_email.sql`, `0005_webhooks_n8n.sql`, `supabase/seed.sql`.

## 3. n8n

Os três workflows estão ativos. O insert e o update de `pedidos` disparam as URLs de produção pelo trigger `notificar_n8n`.

- [Novo pedido](https://marowyck.app.n8n.cloud/workflow/sugYFG7meQqhZ3Lj/executions/7): webhook do Supabase, e-mail do orçamento #013 para `dev.mariaolivia@gmail.com`, R$ 450,00, 02/10/2026.
- [Instalações de amanhã](https://marowyck.app.n8n.cloud/workflow/tJ1sEGJ9qZyDxgyC/executions/8): Elena Rocha, Rua Clélia 210, Pedro, 03/10/2026 às 9h.
- [Faturamento](https://marowyck.app.n8n.cloud/workflow/HosIcG2t55E5tugH/executions/10): webhook do Supabase ao concluir o #013, Pix, R$ 450,00.
- Dia sem instalação não envia e-mail. Cliente sem e-mail, falha do Gmail ou falha do Supabase caem em "Registrar falha".

O passo a passo está em [n8n/README.md](../n8n/README.md).

## 4. Decisões técnicas

**Banco.** O pedido guarda `valor_total`, mas quem escreve essa coluna é o trigger dos itens: soma de `quantidade * preco_unitario`. O subtotal é coluna gerada. O preço do item é copiado do catálogo na hora da inclusão e não muda se o catálogo mudar depois. Assim o Rafael pode reajustar preço sem reescrever orçamento antigo.

**Status.** A transição fica no banco, não só na tela. Orçamento vai para aprovado ou cancelado. Aprovado vai para agendado ou cancelado. Agendado vai para em andamento. Em andamento vai para concluído. Não volta e não pula. Agendar sem técnico ou sem data é recusado. Itens só mudam enquanto o status é orçamento: a tela inclui, remove e altera a quantidade, e o banco recusa qualquer outra fase. Trocar o produto grava o preço atual do catálogo; mudar só a quantidade mantém o preço do orçamento. Cada mudança de status, inclusive a criação, entra em `historico_status`.

**Cálculo do enunciado.** 2 x 450 + 180 = 1080, em centavos no frontend e em `numeric` no Postgres. Os testes `src/utils/money.test.ts` e `src/features/pedidos/domain/calculos.test.ts` travam esse número. O pedido de exemplo da Elena Rocha no seed também soma 1080 e o próprio seed falha se a conta não bater.

**Frontend.** As telas ficam em `src/features/`, com serviços e hooks por domínio. O shell é mobile-first: barra inferior no celular, sidebar de ícones no tablet e sidebar completa no desktop. A área de conteúdo usa a largura da tela.

**Dashboard.** Faturado é a soma dos concluídos no mês corrente, no fuso de São Paulo, porque o problema do Rafael é "quanto já faturou no mês". A receber junta aprovados, agendados e em andamento, sem cortar por mês, porque isso ainda vai entrar. Pendente de agenda é o status aprovado. Próximas instalações são agendadas e em andamento nos próximos 7 dias.

**Auth e RLS.** Qualquer usuário autenticado opera o sistema. Anônimo não lê nada. `historico_status` não tem insert pela API: só o trigger grava. A `service_role` não está no frontend.

**n8n.** Os webhooks do Supabase avisam o n8n, e o n8n manda e-mail para o endereço cadastrado no cliente daquele pedido: orçamento novo, agenda de amanhã às 8h e pedido concluído. A automação 2 não espera evento: ela chama a função `instalacoes_amanha()`, que filtra a data de amanhã em America/Sao_Paulo e devolve o e-mail do cliente. Dia sem instalação não envia e-mail. Cliente sem e-mail, falha do Gmail ou falha do Supabase derruba a execução com mensagem, em vez de marcar sucesso.

**O que eu faria com mais tempo.** Papel de técnico com RLS para cada um ver só a própria agenda. Uma planilha de faturamento além do e-mail. Testes de interface. Um número de pedido visível no WhatsApp que o Rafael manda pro cliente.

## 5. Onde usei IA

Usei o Cursor (modelo Grok) como ferramenta de implementação, no repositório, a partir do enunciado. A IA escreveu o schema, as telas, os workflows e este texto. As regras de negócio (fluxo de status, total 1080, técnicos Lucas e Pedro, as seis telas e as três automações) vieram do teste, não de um tutorial copiado.

O que ainda depende de mim na entrevista: explicar por que o total mora no banco, por que o status não volta, como o n8n lê o Supabase e o que cada tela altera.

## 6. Repositório GitHub

- https://github.com/marowyck/smartlar

O repositório é público. `.env` e a `service_role` não entram nele.

## Checklist antes de enviar

- [x] SQL aplicado e seed rodado
- [x] Usuário do Rafael criado no Auth (`rafael@smartlar.dev`)
- [x] `.env` local e variáveis do deploy
- [x] Link abrindo as seis telas
- [x] Pedido da Elena com total R$ 1.080,00
- [x] Workflows n8n ativos, com logs das três execuções
- [x] Este documento com os links no lugar dos placeholders
