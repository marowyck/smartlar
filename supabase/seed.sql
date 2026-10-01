-- SmartLar — dados de exemplo.
-- Rodar depois das migrations 0001, 0002 e 0003.
-- Pode rodar de novo: se o primeiro cliente já existir, não altera nada.
--
-- Conferência do enunciado: pedido #9 (Elena Rocha) tem
-- 2x Câmera IP (R$ 450) + 1x Sensor de presença (R$ 180) = R$ 1.080,00.

do $seed$
declare
  v_ana uuid := 'a1111111-1111-4111-8111-111111111111';
  v_bruno uuid := 'a2222222-2222-4222-8222-222222222222';
  v_carla uuid := 'a3333333-3333-4333-8333-333333333333';
  v_diego uuid := 'a4444444-4444-4444-8444-444444444444';
  v_elena uuid := 'a5555555-5555-4555-8555-555555555555';
  v_lucas uuid := 'b1111111-1111-4111-8111-111111111111';
  v_pedro uuid := 'b2222222-2222-4222-8222-222222222222';
  v_cam uuid := 'c1111111-1111-4111-8111-111111111101';
  v_sensor uuid := 'c1111111-1111-4111-8111-111111111102';
  v_fechadura uuid := 'c1111111-1111-4111-8111-111111111103';
  v_lampada uuid := 'c1111111-1111-4111-8111-111111111104';
  v_fita uuid := 'c1111111-1111-4111-8111-111111111105';
  v_assistente uuid := 'c1111111-1111-4111-8111-111111111106';
  v_interruptor uuid := 'c1111111-1111-4111-8111-111111111107';
  v_hoje_10 timestamptz;
  v_ontem_15 timestamptz;
  v_amanha_9 timestamptz;
  v_mais_3 timestamptz;
  v_mais_5 timestamptz;
  v_total numeric;
begin
  if exists (select 1 from public.clientes where id = v_ana) then
    raise notice 'Seed SmartLar já aplicado. Nada foi alterado.';
    return;
  end if;

  v_hoje_10 := (date_trunc('day', now() at time zone 'America/Sao_Paulo') + interval '10 hours')
    at time zone 'America/Sao_Paulo';
  v_ontem_15 := (date_trunc('day', now() at time zone 'America/Sao_Paulo') - interval '1 day' + interval '15 hours')
    at time zone 'America/Sao_Paulo';
  v_amanha_9 := (date_trunc('day', now() at time zone 'America/Sao_Paulo') + interval '1 day' + interval '9 hours')
    at time zone 'America/Sao_Paulo';
  v_mais_3 := (date_trunc('day', now() at time zone 'America/Sao_Paulo') + interval '3 days' + interval '14 hours')
    at time zone 'America/Sao_Paulo';
  v_mais_5 := (date_trunc('day', now() at time zone 'America/Sao_Paulo') + interval '5 days' + interval '11 hours')
    at time zone 'America/Sao_Paulo';

  insert into public.clientes (id, nome, telefone, email, endereco) values
    (v_ana, 'Ana Souza', '(11) 98811-1001', 'ana.souza@email.com', 'Rua das Flores, 120, apto 42 — Vila Mariana, São Paulo'),
    (v_bruno, 'Bruno Lima', '(11) 98811-1002', 'bruno.lima@email.com', 'Alameda Santos, 880 — Jardins, São Paulo'),
    (v_carla, 'Carla Mendes', '(11) 98811-1003', 'carla.mendes@email.com', 'Rua Harmonia, 55 — Vila Madalena, São Paulo'),
    (v_diego, 'Diego Alves', '(11) 98811-1004', 'diego.alves@email.com', 'Av. Braz Leme, 1400, casa 3 — Santana, São Paulo'),
    (v_elena, 'Elena Rocha', '(11) 98811-1005', 'elena.rocha@email.com', 'Rua Clélia, 210 — Lapa, São Paulo');

  insert into public.tecnicos (id, nome, telefone, especialidade) values
    (v_lucas, 'Lucas', '(11) 97700-2001', 'Câmeras e sensores'),
    (v_pedro, 'Pedro', '(11) 97700-2002', 'Fechaduras e iluminação');

  insert into public.produtos (id, nome, categoria, preco_unitario, descricao) values
    (v_cam, 'Câmera IP', 'Segurança', 450.00, 'Câmera Wi-Fi full HD com visão noturna e app.'),
    (v_sensor, 'Sensor de presença', 'Segurança', 180.00, 'Sensor de movimento para ambientes internos.'),
    (v_fechadura, 'Fechadura digital', 'Segurança', 890.00, 'Fechadura com senha, tag e biometria.'),
    (v_lampada, 'Lâmpada inteligente', 'Iluminação', 89.00, 'Lâmpada Wi-Fi dimerizável, encaixe E27.'),
    (v_fita, 'Fita LED RGB', 'Iluminação', 220.00, 'Fita LED de 5 metros com controle pelo app.'),
    (v_assistente, 'Assistente de voz', 'Automação', 650.00, 'Alto-falante com assistente para a casa.'),
    (v_interruptor, 'Interruptor inteligente', 'Automação', 159.00, 'Interruptor Wi-Fi para 2 teclas, sem neutro.');

  -- 1. Orçamento — Ana
  insert into public.pedidos (id, cliente_id, observacoes, forma_pagamento)
  values (
    'd1111111-1111-4111-8111-111111111101',
    v_ana,
    'Portão eletrônico antigo, verificar compatibilidade da fechadura.',
    'a_combinar'
  );
  insert into public.itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) values
    ('d1111111-1111-4111-8111-111111111101', v_fechadura, 1, 0),
    ('d1111111-1111-4111-8111-111111111101', v_interruptor, 1, 0);

  -- 2. Orçamento — Bruno
  insert into public.pedidos (id, cliente_id, observacoes)
  values (
    'd1111111-1111-4111-8111-111111111102',
    v_bruno,
    'Cliente pediu para instalar na sala e na cozinha.'
  );
  insert into public.itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) values
    ('d1111111-1111-4111-8111-111111111102', v_assistente, 1, 0);

  -- 3. Aprovado, ainda sem agenda — Carla
  insert into public.pedidos (id, cliente_id, forma_pagamento)
  values ('d1111111-1111-4111-8111-111111111103', v_carla, 'pix');
  insert into public.itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) values
    ('d1111111-1111-4111-8111-111111111103', v_lampada, 2, 0),
    ('d1111111-1111-4111-8111-111111111103', v_fita, 1, 0);
  update public.pedidos
  set status = 'aprovado'
  where id = 'd1111111-1111-4111-8111-111111111103';

  -- 4. Aprovado, ainda sem agenda — Diego
  insert into public.pedidos (id, cliente_id, observacoes, forma_pagamento)
  values (
    'd1111111-1111-4111-8111-111111111104',
    v_diego,
    'Apartamento, síndico precisa liberar a entrada.',
    'boleto'
  );
  insert into public.itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) values
    ('d1111111-1111-4111-8111-111111111104', v_sensor, 1, 0);
  update public.pedidos
  set status = 'aprovado'
  where id = 'd1111111-1111-4111-8111-111111111104';

  -- 5. Agendado para amanhã 09:00 — Elena / Pedro (entra na automação 2)
  insert into public.pedidos (id, cliente_id, observacoes, forma_pagamento)
  values (
    'd1111111-1111-4111-8111-111111111105',
    v_elena,
    'Troca da fechadura da porta da rua.',
    'pix'
  );
  insert into public.itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) values
    ('d1111111-1111-4111-8111-111111111105', v_fechadura, 1, 0),
    ('d1111111-1111-4111-8111-111111111105', v_fita, 1, 0);
  update public.pedidos
  set status = 'aprovado'
  where id = 'd1111111-1111-4111-8111-111111111105';
  update public.pedidos
  set status = 'agendado', tecnico_id = v_pedro, data_instalacao = v_amanha_9
  where id = 'd1111111-1111-4111-8111-111111111105';

  -- 6. Agendado daqui a 3 dias — Ana / Lucas
  insert into public.pedidos (id, cliente_id, forma_pagamento)
  values ('d1111111-1111-4111-8111-111111111106', v_ana, 'cartao');
  insert into public.itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) values
    ('d1111111-1111-4111-8111-111111111106', v_cam, 2, 0);
  update public.pedidos set status = 'aprovado' where id = 'd1111111-1111-4111-8111-111111111106';
  update public.pedidos
  set status = 'agendado', tecnico_id = v_lucas, data_instalacao = v_mais_3
  where id = 'd1111111-1111-4111-8111-111111111106';

  -- 7. Agendado daqui a 5 dias — Bruno / Lucas
  insert into public.pedidos (id, cliente_id, observacoes, forma_pagamento)
  values (
    'd1111111-1111-4111-8111-111111111107',
    v_bruno,
    'Câmera na garagem e sensores na área externa.',
    'transferencia'
  );
  insert into public.itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) values
    ('d1111111-1111-4111-8111-111111111107', v_cam, 1, 0),
    ('d1111111-1111-4111-8111-111111111107', v_sensor, 2, 0);
  update public.pedidos set status = 'aprovado' where id = 'd1111111-1111-4111-8111-111111111107';
  update public.pedidos
  set status = 'agendado', tecnico_id = v_lucas, data_instalacao = v_mais_5
  where id = 'd1111111-1111-4111-8111-111111111107';

  -- 8. Em andamento hoje — Carla / Lucas
  insert into public.pedidos (id, cliente_id, forma_pagamento)
  values ('d1111111-1111-4111-8111-111111111108', v_carla, 'pix');
  insert into public.itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) values
    ('d1111111-1111-4111-8111-111111111108', v_cam, 1, 0),
    ('d1111111-1111-4111-8111-111111111108', v_sensor, 1, 0);
  update public.pedidos set status = 'aprovado' where id = 'd1111111-1111-4111-8111-111111111108';
  update public.pedidos
  set status = 'agendado', tecnico_id = v_lucas, data_instalacao = v_hoje_10
  where id = 'd1111111-1111-4111-8111-111111111108';
  update public.pedidos
  set status = 'em_andamento'
  where id = 'd1111111-1111-4111-8111-111111111108';

  -- 9. Concluído — Elena. Caso do enunciado: 2x450 + 180 = 1080
  insert into public.pedidos (id, cliente_id, forma_pagamento, observacoes)
  values (
    'd1111111-1111-4111-8111-111111111109',
    v_elena,
    'pix',
    'Instalação de câmeras na sala e sensor no corredor.'
  );
  insert into public.itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) values
    ('d1111111-1111-4111-8111-111111111109', v_cam, 2, 0),
    ('d1111111-1111-4111-8111-111111111109', v_sensor, 1, 0);
  update public.pedidos set status = 'aprovado' where id = 'd1111111-1111-4111-8111-111111111109';
  update public.pedidos
  set status = 'agendado', tecnico_id = v_lucas, data_instalacao = v_ontem_15
  where id = 'd1111111-1111-4111-8111-111111111109';
  update public.pedidos set status = 'em_andamento' where id = 'd1111111-1111-4111-8111-111111111109';
  update public.pedidos set status = 'concluido' where id = 'd1111111-1111-4111-8111-111111111109';

  -- 10. Concluído — Diego
  insert into public.pedidos (id, cliente_id, forma_pagamento)
  values ('d1111111-1111-4111-8111-111111111110', v_diego, 'cartao');
  insert into public.itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) values
    ('d1111111-1111-4111-8111-111111111110', v_assistente, 1, 0),
    ('d1111111-1111-4111-8111-111111111110', v_interruptor, 1, 0);
  update public.pedidos set status = 'aprovado' where id = 'd1111111-1111-4111-8111-111111111110';
  update public.pedidos
  set status = 'agendado', tecnico_id = v_pedro, data_instalacao = v_ontem_15
  where id = 'd1111111-1111-4111-8111-111111111110';
  update public.pedidos set status = 'em_andamento' where id = 'd1111111-1111-4111-8111-111111111110';
  update public.pedidos set status = 'concluido' where id = 'd1111111-1111-4111-8111-111111111110';

  -- 11. Cancelado a partir do orçamento — Bruno
  insert into public.pedidos (id, cliente_id, observacoes)
  values (
    'd1111111-1111-4111-8111-111111111111',
    v_bruno,
    'Cliente desistiu depois de receber o orçamento.'
  );
  insert into public.itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) values
    ('d1111111-1111-4111-8111-111111111111', v_fechadura, 1, 0);
  update public.pedidos
  set status = 'cancelado'
  where id = 'd1111111-1111-4111-8111-111111111111';

  select valor_total into v_total
  from public.pedidos
  where id = 'd1111111-1111-4111-8111-111111111109';

  if v_total <> 1080.00 then
    raise exception 'Seed inconsistente: pedido da Elena deveria somar 1080 e somou %', v_total;
  end if;

  if (select count(*) from public.clientes) < 5
     or (select count(*) from public.produtos) < 6
     or (select count(*) from public.pedidos) < 8
     or (select count(distinct categoria) from public.produtos) < 3 then
    raise exception 'Seed incompleto';
  end if;
end;
$seed$;
