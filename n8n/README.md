# Automações n8n

Quatro workflows prontos para importar. Eles saem desligados de propósito. Ative só depois de colar a URL do Supabase, a `service_role` e a credencial do Gmail.

No projeto que já está no ar, não importe estes JSON por cima dos workflows ativos: isso apaga a `service_role` e a credencial do Gmail que já estão no n8n cloud. O arquivo local é o modelo, com os dois valores trocados por placeholder.

O destinatário é o e-mail cadastrado no cliente daquele pedido. O workflow busca esse e-mail no Supabase. Cliente sem e-mail interrompe a execução com o nome dele.

## O que cada uma envia

| Arquivo | Quando dispara | E-mail |
| --- | --- | --- |
| [automacao-1-novo-pedido.json](automacao-1-novo-pedido.json) | Insert de pedido com status `orcamento` | Para o e-mail do cliente. Assunto `Orçamento #012 — R$ 1.080,00`, com pedido, valor e data |
| [automacao-2-instalacoes-amanha.json](automacao-2-instalacoes-amanha.json) | Todo dia às 8h (America/Sao_Paulo) | Um e-mail por cliente, com endereço, técnico e horário das instalações dele. Sem agenda, não envia nada |
| [automacao-3-faturamento.json](automacao-3-faturamento.json) | Update em que o status passa a `concluido` | Para o e-mail do cliente. Assunto `Pedido #012 concluído — R$ 1.080,00 (Pix)`, com data, valor e forma de pagamento |
| [automacao-4-orcamento-parado.json](automacao-4-orcamento-parado.json) | Todo dia às 9h (America/Sao_Paulo) | Um e-mail por cliente com os orçamentos parados há 3 dias ou mais. Sem orçamento parado, não envia nada |

A automação 1 espera 3 segundos e busca o pedido de novo. O `valor_total` é calculado quando os itens entram, então o webhook do insert sozinho pode chegar antes da soma. Como o app cria pedido e itens na mesma transação, na prática o dado já está commitado; a espera é uma folga.

## Configurar

1. Crie a conta em [n8n.cloud](https://n8n.cloud).
2. Em Credentials, conecte uma conta Gmail (OAuth2). O remetente é essa conta. Não exporte a credencial para o repositório.
3. Em cada workflow, abra o nó `Configuracao` e troque `SUPABASE_URL` e `SERVICE_ROLE`. Esse é o único nó com esses dois valores. O e-mail de destino vem de `clientes.email`. Não exporte o workflow de volta para o GitHub depois disso: a `service_role` não pode ir para o repositório.
4. No nó "Enviar e-mail" de cada workflow, selecione a credencial do Gmail.
5. Importe os JSON em Workflows > Import from file, só em um n8n vazio. Não reimporte por cima de um workflow que já funciona.
6. Abra o webhook de produção (não o de teste) das automações 1 e 3 e copie a URL.
7. O aviso de pedido novo e de pedido concluído já sai do banco, pelo trigger `notificar_n8n` da migration `0005_webhooks_n8n.sql`. Não crie também um Database Webhook no painel do Supabase para a mesma tabela: os dois juntos mandam o e-mail duas vezes.
8. Ative os quatro workflows. Automação em teste manual não conta: o cron e os webhooks precisam estar ativos.
9. Confira o fuso do workflow. Ele está em `America/Sao_Paulo`, o mesmo fuso de `instalacoes_amanha` e de `orcamentos_parados`.

## Como provar que rodou

- Automação 1: no app, salve um orçamento novo para um cliente que tenha e-mail. Esse cliente recebe o orçamento, com valor e data. No n8n, abra Executions e tire print do log verde.
- Automação 2: clique em "Execute workflow" uma vez para gerar o log de hoje (o cron só roda às 8h). O seed deixa uma instalação para amanhã (Elena Rocha, com o Pedro). O e-mail vai para o endereço da Elena e traz endereço, técnico e horário. Um dia sem agenda termina sem enviar e-mail.
- Automação 3: conclua um pedido no app. O cliente recebe o e-mail de conclusão com data, valor e forma de pagamento.
- Automação 4: deixe um orçamento com mais de 3 dias e execute o workflow uma vez (o cron só roda às 9h). O e-mail vai para o endereço daquele cliente, com número, valor e dias parado. Sem orçamento parado, a execução termina sem enviar.

## Se der erro

O nó do Gmail e os nós HTTP do Supabase têm uma saída de erro. Ela cai em "Registrar falha", que interrompe a execução com a mensagem do Supabase ou do Gmail. A execução fica vermelha no log, em vez de parecer sucesso sem ter enviado nada.

Causas comuns:

- `service_role` ainda está com o texto `COLE_A_SERVICE_ROLE_AQUI`
- o cliente do pedido está sem e-mail no cadastro
- o nó "Enviar e-mail" está sem a credencial do Gmail
- o workflow não está ativo, então o webhook de produção não responde
- a URL do Supabase tem barra no final (o código tira uma, mas não várias)
- o webhook do Supabase aponta para a URL de teste do n8n
