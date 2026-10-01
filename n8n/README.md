# Automações n8n

Três workflows prontos para importar. Eles saem desligados de propósito. Ative só depois de colar a URL do Supabase, a `service_role` e o destino.

O destino padrão é um endereço do [webhook.site](https://webhook.site). Dá para trocar o último nó HTTP por Gmail ou Google Sheets sem mudar o resto do fluxo.

## O que cada uma faz

| Arquivo | Quando dispara | O que envia |
| --- | --- | --- |
| [automacao-1-novo-pedido.json](automacao-1-novo-pedido.json) | Insert de pedido com status `orcamento` | Nome do cliente, valor total e data |
| [automacao-2-instalacoes-amanha.json](automacao-2-instalacoes-amanha.json) | Todo dia às 8h (America/Sao_Paulo) | Instalações de amanhã: cliente, endereço, técnico e horário. Se não houver nenhuma, envia essa informação em vez de falhar em silêncio |
| [automacao-3-faturamento.json](automacao-3-faturamento.json) | Update em que o status passa a `concluido` | Data, cliente, valor e forma de pagamento |

A automação 1 espera 3 segundos e busca o pedido de novo. O `valor_total` é calculado quando os itens entram, então o webhook do insert sozinho pode chegar antes da soma. Como o app cria pedido e itens na mesma transação, na prática o dado já está commitado; a espera é uma folga.

## Configurar

1. Crie a conta em [n8n.cloud](https://n8n.cloud).
2. Em cada workflow, abra o nó de código que tem `SUPABASE_URL`, `SERVICE_ROLE` e `WEBHOOK_DESTINO` e troque os três placeholders. Não exporte o workflow de volta para o GitHub depois disso: a `service_role` não pode ir para o repositório.
3. Importe os JSON em Workflows > Import from file.
4. Abra o webhook de produção (não o de teste) das automações 1 e 3 e copie a URL.
5. No Supabase, em Database > Webhooks, crie:
   - **novo pedido**: tabela `pedidos`, evento Insert, método POST, URL de produção da automação 1.
   - **faturamento**: tabela `pedidos`, evento Update, método POST, URL de produção da automação 3.
6. Ative os três workflows. Automação em teste manual não conta: o cron e os webhooks precisam estar ativos.
7. Confira o fuso do workflow. Ele está em `America/Sao_Paulo`, que é o mesmo fuso da função `instalacoes_amanha`.

## Como provar que rodou

- Automação 1: no app, salve um orçamento novo. O webhook.site deve receber `evento: novo_pedido` com cliente, `valor_total` e `data`. No n8n, abra Executions e tire print do log verde.
- Automação 2: clique em "Execute workflow" uma vez para gerar o log de hoje (o cron só roda às 8h). O seed deixa uma instalação para amanhã (Elena Rocha, com o Pedro). O payload traz cliente, endereço, técnico e horário. Para o caso vazio, a execução de um dia sem agenda envia `vazio: true` e a mensagem "Nenhuma instalação agendada para amanhã."
- Automação 3: conclua um pedido no app. O destino recebe `evento: faturamento` com data, cliente, valor e forma de pagamento.

## Se der erro

Os nós HTTP têm uma saída de erro. Ela cai em "Registrar falha", que interrompe a execução com a mensagem do Supabase ou do destino. A execução fica vermelha no log, em vez de parecer sucesso sem ter enviado nada.

Causas comuns:

- `service_role` ainda está com o texto `COLE_A_SERVICE_ROLE_AQUI`
- o workflow não está ativo, então o webhook de produção não responde
- a URL do Supabase tem barra no final (o código tira uma, mas não várias)
- o webhook do Supabase aponta para a URL de teste do n8n
