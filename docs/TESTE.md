# Roteiro de teste ponta a ponta

Faça isto com o SQL já aplicado, um usuário criado no Auth e o `.env` preenchido.

1. Entre no sistema.
2. Confira o dashboard: há pedidos do mês, valor faturado, valor a receber, pendentes de agenda, instalações dos próximos 7 dias e orçamentos parados.
3. Cadastre um cliente novo, com telefone. Busque pelo nome e pelo telefone. Abra o cliente e veja a lista de pedidos (vazia no começo).
4. Em Produtos, confira as categorias Segurança, Iluminação e Automação. Altere o preço de um produto que não vai entrar no pedido de teste.
5. Crie um pedido para o cliente novo:
   - 2x Câmera IP (R$ 450)
   - 1x Sensor de presença (R$ 180)
   - uma observação
   - salve como orçamento
6. O total na tela e no detalhe do pedido tem que ser **R$ 1.080,00**. O mesmo valor tem que aparecer na coluna `valor_total` no Supabase.
7. Tente pular de orçamento para concluído. O botão não oferece esse salto. Se alguém forçar pelo banco, o trigger recusa.
8. Aprove, depois agende escolhendo técnico e data. Sem os dois, o banco recusa.
9. Na agenda desse técnico, marque em andamento e depois conclua.
10. Volte ao dashboard: o pedido sai de "a receber" e entra no faturado do mês. O gráfico dos últimos 6 meses continua no cartão de cima.
11. Se os workflows n8n estiverem ativos, o orçamento novo disparou a automação 1 e a conclusão disparou a automação 3.
12. Em Relatórios, confira ticket médio, taxa de conversão, descontos, o gráfico de barras, o donut de status, o ranking de produtos e Lucas contra Pedro. Exporte o CSV.
13. Em Equipe, abra o cartão de cada técnico e o atalho da agenda dele.
14. Na agenda, troque "Por técnico" por "Semana toda". As colunas de Lucas e Pedro ficam lado a lado.
15. Em um orçamento, informe um desconto. O resumo mostra subtotal, desconto e total. Com desconto zero, o caso da Elena continua **R$ 1.080,00**.
16. No detalhe do pedido, use "Enviar por WhatsApp" e "Imprimir orçamento". A folha abre sem o menu e o botão Salvar PDF chama a impressão do navegador.
17. Tente agendar o mesmo técnico em outro pedido com menos de 2 horas de diferença. A tela mostra a recusa do banco.

O seed já traz o mesmo caso de R$ 1.080 no pedido da Elena Rocha, concluído, para o avaliador ver sem criar nada. O `seed_historico.sql` completa os meses anteriores do gráfico e deixa os gatilhos do n8n desligados só durante essa carga.
