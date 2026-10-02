-- Avisa o n8n quando um pedido entra ou muda.
-- O workflow filtra: insert de orçamento, ou a passagem para concluído.

create extension if not exists pg_net;

create or replace function public.notificar_n8n()
returns trigger
language plpgsql
security definer
set search_path = public, net
as $$
declare
  destino text := TG_ARGV[0];
begin
  if destino is null or btrim(destino) = '' then
    raise exception 'URL do n8n ausente';
  end if;

  perform net.http_post(
    url := destino,
    body := jsonb_build_object(
      'type', TG_OP,
      'table', TG_TABLE_NAME,
      'schema', TG_TABLE_SCHEMA,
      'record', to_jsonb(new),
      'old_record', case when TG_OP = 'INSERT' then null else to_jsonb(old) end
    ),
    headers := '{"Content-Type": "application/json"}'::jsonb,
    timeout_milliseconds := 5000
  );

  return new;
end;
$$;

drop trigger if exists trg_n8n_novo_pedido on public.pedidos;
create trigger trg_n8n_novo_pedido
after insert on public.pedidos
for each row
execute function public.notificar_n8n(
  'https://marowyck.app.n8n.cloud/webhook/smartlar-novo-pedido'
);

drop trigger if exists trg_n8n_pedido_atualizado on public.pedidos;
create trigger trg_n8n_pedido_atualizado
after update on public.pedidos
for each row
execute function public.notificar_n8n(
  'https://marowyck.app.n8n.cloud/webhook/smartlar-pedido-concluido'
);

revoke all on function public.notificar_n8n() from public, anon;
grant execute on function public.notificar_n8n() to authenticated, service_role;
