-- Pedidos concluídos nos meses anteriores, para o gráfico de faturamento não ficar de um mês só.
-- Os triggers do n8n ficam desligados durante a carga: senão cada linha mandaria e-mail.
-- Pode rodar de novo: se o primeiro pedido histórico já existir, não altera nada.
-- Não mexe no pedido #9 da Elena (R$ 1.080,00).

alter table public.pedidos disable trigger trg_n8n_novo_pedido;
alter table public.pedidos disable trigger trg_n8n_pedido_atualizado;

do $hist$
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
  v_marco uuid := 'e1111111-1111-4111-8111-111111111201';
begin
  if exists (select 1 from public.pedidos where id = v_marco) then
    raise notice 'Histórico SmartLar já aplicado. Nada foi alterado.';
    return;
  end if;

  -- Maio — Ana, 2x câmera, Lucas
  insert into public.pedidos (id, cliente_id, observacoes, forma_pagamento, created_at)
  values (v_marco, v_ana, 'Instalação histórica de maio.', 'pix', timestamptz '2026-05-12 15:00:00+00');
  insert into public.itens_pedido (pedido_id, produto_id, quantidade, preco_unitario)
  values (v_marco, v_cam, 2, 0);
  update public.pedidos set status = 'aprovado' where id = v_marco;
  update public.pedidos
  set status = 'agendado', tecnico_id = v_lucas, data_instalacao = timestamptz '2026-05-18 13:00:00+00'
  where id = v_marco;
  update public.pedidos set status = 'em_andamento' where id = v_marco;
  update public.pedidos set status = 'concluido' where id = v_marco;
  update public.pedidos set concluido_em = timestamptz '2026-05-18 18:00:00+00' where id = v_marco;

  -- Junho — Bruno, fechadura, Pedro
  insert into public.pedidos (id, cliente_id, observacoes, forma_pagamento, created_at)
  values ('e1111111-1111-4111-8111-111111111202', v_bruno, 'Instalação histórica de junho.', 'cartao', timestamptz '2026-06-08 15:00:00+00');
  insert into public.itens_pedido (pedido_id, produto_id, quantidade, preco_unitario)
  values ('e1111111-1111-4111-8111-111111111202', v_fechadura, 1, 0);
  update public.pedidos set status = 'aprovado' where id = 'e1111111-1111-4111-8111-111111111202';
  update public.pedidos
  set status = 'agendado', tecnico_id = v_pedro, data_instalacao = timestamptz '2026-06-14 14:00:00+00'
  where id = 'e1111111-1111-4111-8111-111111111202';
  update public.pedidos set status = 'em_andamento' where id = 'e1111111-1111-4111-8111-111111111202';
  update public.pedidos set status = 'concluido' where id = 'e1111111-1111-4111-8111-111111111202';
  update public.pedidos set concluido_em = timestamptz '2026-06-14 19:00:00+00' where id = 'e1111111-1111-4111-8111-111111111202';

  -- Julho — Carla, câmera + sensor, Lucas
  insert into public.pedidos (id, cliente_id, observacoes, forma_pagamento, created_at)
  values ('e1111111-1111-4111-8111-111111111203', v_carla, 'Instalação histórica de julho.', 'pix', timestamptz '2026-07-06 15:00:00+00');
  insert into public.itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) values
    ('e1111111-1111-4111-8111-111111111203', v_cam, 1, 0),
    ('e1111111-1111-4111-8111-111111111203', v_sensor, 1, 0);
  update public.pedidos set status = 'aprovado' where id = 'e1111111-1111-4111-8111-111111111203';
  update public.pedidos
  set status = 'agendado', tecnico_id = v_lucas, data_instalacao = timestamptz '2026-07-11 13:00:00+00'
  where id = 'e1111111-1111-4111-8111-111111111203';
  update public.pedidos set status = 'em_andamento' where id = 'e1111111-1111-4111-8111-111111111203';
  update public.pedidos set status = 'concluido' where id = 'e1111111-1111-4111-8111-111111111203';
  update public.pedidos set concluido_em = timestamptz '2026-07-11 18:00:00+00' where id = 'e1111111-1111-4111-8111-111111111203';

  -- Agosto — Diego, 4 lâmpadas + fita, Pedro
  insert into public.pedidos (id, cliente_id, observacoes, forma_pagamento, created_at)
  values ('e1111111-1111-4111-8111-111111111204', v_diego, 'Instalação histórica de agosto.', 'pix', timestamptz '2026-08-04 15:00:00+00');
  insert into public.itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) values
    ('e1111111-1111-4111-8111-111111111204', v_lampada, 4, 0),
    ('e1111111-1111-4111-8111-111111111204', v_fita, 1, 0);
  update public.pedidos set status = 'aprovado' where id = 'e1111111-1111-4111-8111-111111111204';
  update public.pedidos
  set status = 'agendado', tecnico_id = v_pedro, data_instalacao = timestamptz '2026-08-09 14:00:00+00'
  where id = 'e1111111-1111-4111-8111-111111111204';
  update public.pedidos set status = 'em_andamento' where id = 'e1111111-1111-4111-8111-111111111204';
  update public.pedidos set status = 'concluido' where id = 'e1111111-1111-4111-8111-111111111204';
  update public.pedidos set concluido_em = timestamptz '2026-08-09 19:00:00+00' where id = 'e1111111-1111-4111-8111-111111111204';

  -- Setembro — Elena, assistente, Lucas. Não é o pedido #9.
  insert into public.pedidos (id, cliente_id, observacoes, forma_pagamento, created_at)
  values ('e1111111-1111-4111-8111-111111111205', v_elena, 'Instalação histórica de setembro.', 'transferencia', timestamptz '2026-09-07 15:00:00+00');
  insert into public.itens_pedido (pedido_id, produto_id, quantidade, preco_unitario)
  values ('e1111111-1111-4111-8111-111111111205', v_assistente, 1, 0);
  update public.pedidos set status = 'aprovado' where id = 'e1111111-1111-4111-8111-111111111205';
  update public.pedidos
  set status = 'agendado', tecnico_id = v_lucas, data_instalacao = timestamptz '2026-09-12 13:00:00+00'
  where id = 'e1111111-1111-4111-8111-111111111205';
  update public.pedidos set status = 'em_andamento' where id = 'e1111111-1111-4111-8111-111111111205';
  update public.pedidos set status = 'concluido' where id = 'e1111111-1111-4111-8111-111111111205';
  update public.pedidos set concluido_em = timestamptz '2026-09-12 18:00:00+00' where id = 'e1111111-1111-4111-8111-111111111205';
end;
$hist$;

alter table public.pedidos enable trigger trg_n8n_novo_pedido;
alter table public.pedidos enable trigger trg_n8n_pedido_atualizado;
