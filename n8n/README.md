# Automações n8n

Três workflows prontos para importar. Eles saem desligados de propósito. Ative só depois de colar a URL do Supabase, a `service_role`, o e-mail do Rafael e a credencial do Gmail.

Os avisos vão para a caixa do Rafael, o gestor. Lucas e Pedro só têm telefone no banco, então a operação chega por e-mail numa caixa só.

## O que cada uma envia

| Arquivo | Quando dispara | E-mail |
| --- | --- | --- |
| [automacao-1-novo-pedido.json](automacao-1-novo-pedido.json) | Insert de pedido com status `orcamento` | Assunto `Novo orçamento #012 — Elena Rocha — R$ 1.080,00`, com pedido, cliente, valor e data |
| [automacao-2-instalacoes-amanha.json](automacao-2-instalacoes-amanha.json) | Todo dia às 8h (America/Sao_Paulo) | Assunto `Amanhã: 2 instalações`, com endereço, técnico e horário de cada uma. Sem agenda, o assunto é `Amanhã: nenhuma instalação` |
| [automacao-3-faturamento.json](automacao-3-faturamento.json) | Update em que o status passa a `concluido` | Assunto `Faturado #012 — Elena Rocha — R$ 1.080,00 (Pix)`, com data, cliente, valor e forma de pagamento |

A automação 1 espera 3 segundos e busca o pedido de novo. O `valor_total` é calculado quando os itens entram, então o webhook do insert sozinho pode chegar antes da soma. Como o app cria pedido e itens na mesma transação, na prática o dado já está commitado; a espera é uma folga.

## Configurar

1. Crie a conta em [n8n.cloud](https://n8n.cloud).
2. Em Credentials, conecte uma conta Gmail (OAuth2). O remetente é essa conta. Não exporte a credencial para o repositório.
3. Em cada workflow, abra o nó de código que tem `SUPABASE_URL`, `SERVICE_ROLE` e `EMAIL_DESTINO` e troque os três placeholders. `EMAIL_DESTINO` é o e-mail do Rafael. Não exporte o workflow de volta para o GitHub depois disso: a `service_role` não pode ir para o repositório.
4. No nó "Enviar e-mail" de cada workflow, selecione a credencial do Gmail.
5. Importe os JSON em Workflows > Import from file.
6. Abra o webhook de produção (não o de teste) das automações 1 e 3 e copie a URL.
7. No Supabase, em Database > Webhooks, crie:
   - **novo pedido**: tabela `pedidos`, evento Insert, método POST, URL de produção da automação 1.
   - **faturamento**: tabela `pedidos`, evento Update, método POST, URL de produção da automação 3.
8. Ative os três workflows. Automação em teste manual não conta: o cron e os webhooks precisam estar ativos.
9. Confira o fuso do workflow. Ele está em `America/Sao_Paulo`, que é o mesmo fuso da função `instalacoes_amanha`.

## Como provar que rodou

- Automação 1: no app, salve um orçamento novo. A caixa do Rafael recebe o e-mail de novo orçamento, com cliente, valor e data. No n8n, abra Executions e tire print do log verde.
- Automação 2: clique em "Execute workflow" uma vez para gerar o log de hoje (o cron só roda às 8h). O seed deixa uma instalação para amanhã (Elena Rocha, com o Pedro). O e-mail traz cliente, endereço, técnico e horário. Para o caso vazio, a execução de um dia sem agenda manda "Nenhuma instalação agendada para amanhã."
- Automação 3: conclua um pedido no app. O Rafael recebe o e-mail de faturamento com data, cliente, valor e forma de pagamento.

## Se der erro

O nó do Gmail e os nós HTTP do Supabase têm uma saída de erro. Ela cai em "Registrar falha", que interrompe a execução com a mensagem do Supabase ou do Gmail. A execução fica vermelha no log, em vez de parecer sucesso sem ter enviado nada.

Causas comuns:

- `service_role` ainda está com o texto `COLE_A_SERVICE_ROLE_AQUI`
- `EMAIL_DESTINO` ainda está com `COLE_O_EMAIL_DO_RAFAEL`
- o nó "Enviar e-mail" está sem a credencial do Gmail
- o workflow não está ativo, então o webhook de produção não responde
- a URL do Supabase tem barra no final (o código tira uma, mas não várias)
- o webhook do Supabase aponta para a URL de teste do n8n
