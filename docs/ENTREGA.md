# SmartLar — documento de entrega

Sistema de gestão da SmartLar para o Rafael: clientes, catálogo, orçamentos, agenda dos técnicos e indicadores do mês. Frontend em Vite + React + shadcn/ui, banco no Supabase, automações no n8n.

## 1. Link do projeto funcionando

- Produção: `https://temporary-prompt-krypton-xweiyzs.vercel.app`
- Login de demonstração: `rafael@smartlar.dev` / `SmartLar-rafael-2026`
- Comando local: `npm install`, copiar `.env.example` para `.env`, `npm run dev`

## 2. Supabase

- Projeto: `https://supabase.com/dashboard/project/cpnsbtrlagsqemldzcif`

O que mostrar nos prints:

- Tabelas `clientes`, `tecnicos`, `produtos`, `pedidos`, `itens_pedido`, `historico_status`
- Diagrama ou colunas com as foreign keys (`cliente_id`, `tecnico_id`, `pedido_id`, `produto_id`)
- Dados de exemplo: clientes, Lucas e Pedro, 7 produtos em 3 categorias, pedidos em todos os status e concluídos de maio a outubro para o gráfico
- Pedido da Elena Rocha com 2x Câmera IP + 1x Sensor de presença, desconto 0 e `valor_total = 1080.00`

SQL, nesta ordem: `0001_schema.sql` até `0009_orcamentos_parados.sql`, depois `seed.sql` e `seed_historico.sql`. A lista completa está em [supabase/README.md](../supabase/README.md).

## 3. n8n

Os quatro workflows estão ativos. O insert e o update de `pedidos` disparam as URLs de produção pelo trigger `notificar_n8n`. A automação 4 roda sozinha às 9h.

- [Novo pedido](https://marowyck.app.n8n.cloud/workflow/sugYFG7meQqhZ3Lj/executions/7): webhook do Supabase, e-mail do orçamento #013 para `dev.mariaolivia@gmail.com`, R$ 450,00, 02/10/2026.
- [Instalações de amanhã](https://marowyck.app.n8n.cloud/workflow/tJ1sEGJ9qZyDxgyC/executions/8): Elena Rocha, Rua Clélia 210, Pedro, 03/10/2026 às 9h.
- [Faturamento](https://marowyck.app.n8n.cloud/workflow/HosIcG2t55E5tugH/executions/10): webhook do Supabase ao concluir o #013, Pix, R$ 450,00.
- [Orçamento parado](https://marowyck.app.n8n.cloud/workflow/4blvwYh6uhBcBpcU/executions/19): orçamento #012 da Maria Olívia, R$ 650,00, parado há 4 dias, enviado para `dev.mariaolivia@gmail.com`.
- Sem instalação no dia, ou sem orçamento parado, não envia e-mail. Cliente sem e-mail, falha do Gmail ou falha do Supabase caem em "Registrar falha".

O passo a passo está em [n8n/README.md](../n8n/README.md).

## 4. Decisões técnicas

**Banco.** O pedido guarda `valor_total`, mas quem escreve essa coluna é o trigger: soma de `quantidade * preco_unitario`, menos `desconto`. O desconto só existe enquanto o status é orçamento, começa em zero e nunca deixa o total negativo. Com desconto zero o pedido da Elena continua 1080. O subtotal é coluna gerada. O preço do item é copiado do catálogo na hora da inclusão e não muda se o catálogo mudar depois. Assim o Rafael pode reajustar preço sem reescrever orçamento antigo.

**Status.** A transição fica no banco, não só na tela. Orçamento vai para aprovado ou cancelado. Aprovado vai para agendado ou cancelado. Agendado vai para em andamento. Em andamento vai para concluído. Não volta e não pula. Agendar sem técnico ou sem data é recusado. O mesmo técnico não pode ter dois pedidos agendados ou em andamento com menos de 2 horas de diferença: o banco recusa com a mensagem "Esse técnico já tem instalação a menos de 2 horas desse horário". Itens e desconto só mudam enquanto o status é orçamento. Trocar o produto grava o preço atual do catálogo; mudar só a quantidade mantém o preço do orçamento. Cada mudança de status, inclusive a criação, entra em `historico_status`.

**Cálculo do enunciado.** 2 x 450 + 180 = 1080, em centavos no frontend e em `numeric` no Postgres. Os testes `src/utils/money.test.ts` e `src/features/pedidos/domain/calculos.test.ts` travam esse número. O pedido de exemplo da Elena Rocha no seed também soma 1080 e o próprio seed falha se a conta não bater.

**Frontend.** As telas ficam em `src/features/`, com serviços e hooks por domínio. O shell é mobile-first: barra inferior no celular, sidebar de ícones no tablet e sidebar completa no desktop. A área de conteúdo usa a largura da tela.

**Dashboard e relatórios.** Faturado é a soma dos concluídos no mês corrente, no fuso de São Paulo, porque o problema do Rafael é "quanto já faturou no mês". A receber junta aprovados, agendados e em andamento, sem cortar por mês, porque isso ainda vai entrar. Pendente de agenda é o status aprovado. Próximas instalações são agendadas e em andamento nos próximos 7 dias. As views de relatório (`vw_faturamento_mensal`, `vw_pedidos_por_status`, `vw_produtos_vendidos`, `vw_desempenho_tecnico` e `vw_conversao`) usam `security_invoker`, então respeitam o mesmo login da tela. O gráfico dos últimos 6 meses lê o mês em que o pedido foi concluído, não o mês em que foi criado.

**Auth e RLS.** Qualquer usuário autenticado opera o sistema. Anônimo não lê nada. `historico_status` não tem insert pela API: só o trigger grava. A `service_role` não está no frontend.

**n8n.** Os webhooks do Supabase avisam o n8n, e o n8n manda e-mail para o endereço cadastrado no cliente daquele pedido: orçamento novo, agenda de amanhã às 8h e pedido concluído. A automação 2 chama `instalacoes_amanha()`. A automação 4, às 9h, chama `orcamentos_parados(3)` e agrupa por cliente. Sem agenda no dia, ou sem orçamento parado, não envia e-mail. Cliente sem e-mail, falha do Gmail ou falha do Supabase derruba a execução com mensagem, em vez de marcar sucesso.

**Telas a mais.** Relatórios mostra ticket médio, taxa de conversão, total descontado, o gráfico de barras, o donut de status, o ranking de produtos, Lucas contra Pedro e a exportação CSV. Equipe mostra um cartão por técnico. O pedido tem desconto, texto pronto de WhatsApp e uma folha de orçamento para imprimir ou salvar em PDF. A agenda alterna entre um técnico e a semana dos dois.

**O que eu faria com mais tempo.** Papel de técnico com RLS para cada um ver só a própria agenda. Uma planilha de faturamento no Google Sheets, que pede a conta Google conectada no n8n. Testes de interface.

## 5. Onde usei IA

Usei o Cursor (modelo Grok) como ferramenta de implementação, no repositório, a partir do enunciado. A IA escreveu o schema, as telas, os workflows e este texto. As regras de negócio (fluxo de status, total 1080, técnicos Lucas e Pedro, as telas e as automações) vieram do teste e do que o Rafael precisaria mostrar na operação, não de um tutorial copiado.

O que ainda depende de mim na entrevista: explicar por que o total mora no banco, por que o status não volta, como o n8n lê o Supabase e o que cada tela altera.

## 6. Repositório GitHub

- https://github.com/marowyck/smartlar

O repositório é público. `.env` e a `service_role` não entram nele.

## Checklist antes de enviar

- [x] SQL aplicado e seed rodado
- [x] Usuário do Rafael criado no Auth (`rafael@smartlar.dev`)
- [x] `.env` local e variáveis do deploy
- [x] Link abrindo as telas, inclusive Relatórios, Equipe e o orçamento para imprimir
- [x] Pedido da Elena com total R$ 1.080,00
- [x] Workflows n8n ativos, com logs das quatro execuções
- [x] Este documento com os links no lugar dos placeholders
