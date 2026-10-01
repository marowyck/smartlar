# SmartLar — documento de entrega

Sistema de gestão da SmartLar para o Rafael: clientes, catálogo, orçamentos, agenda dos técnicos e indicadores do mês. Frontend em Vite + React + shadcn/ui, banco no Supabase, automações no n8n.

## 1. Link do projeto funcionando

Preencher depois do deploy (Vercel ou Netlify):

- Produção: `https://SEU-PROJETO.vercel.app`
- Comando local: `npm install`, copiar `.env.example` para `.env`, `npm run dev`

O build de produção já passa (`npm run build`). `vercel.json` e `netlify.toml` reescrevem as rotas da SPA para `index.html`. No provedor, configurar `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` antes do build.

## 2. Supabase

Preencher com o link do projeto:

- Projeto: `https://supabase.com/dashboard/project/SEU-REF`

O que mostrar nos prints:

- Tabelas `clientes`, `tecnicos`, `produtos`, `pedidos`, `itens_pedido`, `historico_status`
- Diagrama ou colunas com as foreign keys (`cliente_id`, `tecnico_id`, `pedido_id`, `produto_id`)
- Dados do seed: 5 clientes, Lucas e Pedro, 7 produtos em 3 categorias, 11 pedidos
- Pedido da Elena Rocha com 2x Câmera IP + 1x Sensor de presença e `valor_total = 1080.00`

SQL, nesta ordem: `supabase/migrations/0001_schema.sql`, `0002_functions.sql`, `0003_rls.sql`, `supabase/seed.sql`.

## 3. n8n

Prints a tirar depois de importar e ativar:

- Canvas de cada workflow em `n8n/`
- Execução verde da automação 1, com cliente, valor e data
- Execução verde da automação 2, com a instalação de amanhã (Elena, endereço, Pedro, horário)
- Execução verde da automação 3 ao concluir um pedido
- Uma execução vermelha, se quiser mostrar o nó "Registrar falha" (basta deixar a URL do destino inválida uma vez)

O passo a passo está em [n8n/README.md](../n8n/README.md).

## 4. Decisões técnicas

**Banco.** O pedido guarda `valor_total`, mas quem escreve essa coluna é o trigger dos itens: soma de `quantidade * preco_unitario`. O subtotal é coluna gerada. O preço do item é copiado do catálogo na hora da inclusão e não muda se o catálogo mudar depois. Assim o Rafael pode reajustar preço sem reescrever orçamento antigo.

**Status.** A transição fica no banco, não só na tela. Orçamento vai para aprovado ou cancelado. Aprovado vai para agendado ou cancelado. Agendado vai para em andamento. Em andamento vai para concluído. Não volta e não pula. Agendar sem técnico ou sem data é recusado. Itens só mudam enquanto o status é orçamento. Cada mudança, inclusive a criação, entra em `historico_status`.

**Cálculo do enunciado.** 2 x 450 + 180 = 1080, em centavos no frontend e em `numeric` no Postgres. Os testes `src/shared/lib/money.test.ts` e `src/features/pedidos/domain/calculos.test.ts` travam esse número. O pedido de exemplo da Elena Rocha no seed também soma 1080 e o próprio seed falha se a conta não bater.

**Frontend.** As telas ficam em `src/features/`, com serviços e hooks por domínio. O shell é mobile-first: barra inferior no celular, sidebar de ícones no tablet e sidebar completa no desktop. A área de conteúdo usa a largura da tela.

**Dashboard.** Faturado é a soma dos concluídos no mês corrente, no fuso de São Paulo, porque o problema do Rafael é "quanto já faturou no mês". A receber junta aprovados, agendados e em andamento, sem cortar por mês, porque isso ainda vai entrar. Pendente de agenda é o status aprovado. Próximas instalações são agendadas e em andamento nos próximos 7 dias.

**Auth e RLS.** Qualquer usuário autenticado opera o sistema. Anônimo não lê nada. `historico_status` não tem insert pela API: só o trigger grava. A `service_role` não está no frontend.

**n8n.** Os webhooks do Supabase avisam o n8n. A automação 2 não espera evento: ela chama a função `instalacoes_amanha()`, que filtra a data de amanhã em America/Sao_Paulo. Dia sem instalação gera um aviso explícito. Falha de HTTP derruba a execução com mensagem, em vez de marcar sucesso.

**O que eu faria com mais tempo.** Papel de técnico com RLS para cada um ver só a própria agenda. Editar ou remover itens enquanto ainda é orçamento. Trocar o webhook.site por uma planilha de faturamento. Testes de interface. Um número de pedido visível no WhatsApp que o Rafael manda pro cliente.

## 5. Onde usei IA

Usei o Cursor (modelo Grok) como ferramenta de implementação, no repositório, a partir do enunciado. A IA escreveu o schema, as telas, os workflows e este texto. As regras de negócio (fluxo de status, total 1080, técnicos Lucas e Pedro, as seis telas e as três automações) vieram do teste, não de um tutorial copiado.

O que ainda depende de mim na entrevista: explicar por que o total mora no banco, por que o status não volta, como o n8n lê o Supabase e o que cada tela altera.

## 6. Repositório GitHub

Preencher depois do push:

- `https://github.com/SEU-USUARIO/smartlar`

O repositório precisa ser público. Não commitar `.env` nem a `service_role`.

## Checklist antes de enviar

- [ ] SQL aplicado e seed rodado
- [ ] Usuário do Rafael criado no Auth
- [ ] `.env` local e variáveis do deploy
- [ ] Link abrindo as seis telas
- [ ] Pedido novo com total R$ 1.080,00
- [ ] Workflows n8n ativos, com prints e logs
- [ ] Este documento com os links no lugar dos placeholders
