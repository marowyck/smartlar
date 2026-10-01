-- SmartLar — schema base
-- Rodar uma vez, em projeto vazio, antes de 0002 e 0003.
-- Fuso de negócio: America/Sao_Paulo (usado nas views/funções da 0002).

create extension if not exists pgcrypto;

do $$
begin
  create type public.status_pedido as enum (
    'orcamento',
    'aprovado',
    'agendado',
    'em_andamento',
    'concluido',
    'cancelado'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.forma_pagamento as enum (
    'pix',
    'cartao',
    'boleto',
    'dinheiro',
    'transferencia',
    'a_combinar'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(trim(nome)) > 0),
  telefone text not null check (char_length(trim(telefone)) > 0),
  email text,
  endereco text not null check (char_length(trim(endereco)) > 0),
  created_at timestamptz not null default now()
);

comment on table public.clientes is
  'Clientes da SmartLar. Telefone é o WhatsApp. Endereço é o local da instalação.';

create table if not exists public.tecnicos (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(trim(nome)) > 0),
  telefone text not null check (char_length(trim(telefone)) > 0),
  especialidade text not null check (char_length(trim(especialidade)) > 0),
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.tecnicos is
  'Equipe de instalação. Lucas (câmeras e sensores) e Pedro (fechaduras e iluminação).';

create table if not exists public.produtos (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(trim(nome)) > 0),
  categoria text not null check (char_length(trim(categoria)) > 0),
  preco_unitario numeric(10, 2) not null check (preco_unitario >= 0),
  descricao text,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

comment on column public.produtos.preco_unitario is
  'Preço vigente de catálogo. O item do pedido guarda uma cópia (snapshot) no momento da venda.';

create table if not exists public.pedidos (
  id uuid primary key default gen_random_uuid(),
  numero integer generated always as identity unique,
  cliente_id uuid not null references public.clientes (id) on delete restrict,
  tecnico_id uuid references public.tecnicos (id) on delete restrict,
  status public.status_pedido not null default 'orcamento',
  data_instalacao timestamptz,
  valor_total numeric(12, 2) not null default 0 check (valor_total >= 0),
  forma_pagamento public.forma_pagamento,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  concluido_em timestamptz
);

comment on column public.pedidos.valor_total is
  'Soma dos subtotais dos itens. Recalculado por trigger; não deve ser editado manualmente.';
comment on column public.pedidos.data_instalacao is
  'Obrigatória a partir do status agendado. Guardada em timestamptz (horário incluso).';

create table if not exists public.itens_pedido (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos (id) on delete cascade,
  produto_id uuid not null references public.produtos (id) on delete restrict,
  quantidade integer not null check (quantidade > 0),
  preco_unitario numeric(10, 2) not null check (preco_unitario >= 0),
  subtotal numeric(12, 2) generated always as (quantidade * preco_unitario) stored,
  created_at timestamptz not null default now(),
  unique (pedido_id, produto_id)
);

comment on column public.itens_pedido.preco_unitario is
  'Snapshot do preço no momento em que o item entrou no pedido.';
comment on column public.itens_pedido.subtotal is
  'quantidade * preco_unitario, calculado pelo banco.';

create table if not exists public.historico_status (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos (id) on delete cascade,
  status_anterior public.status_pedido,
  status_novo public.status_pedido not null,
  alterado_em timestamptz not null default now()
);

comment on table public.historico_status is
  'Uma linha por mudança de status, inclusive a criação (status_anterior nulo).';

create index if not exists idx_clientes_nome on public.clientes (lower(nome));
create index if not exists idx_clientes_telefone on public.clientes (telefone);
create index if not exists idx_produtos_categoria on public.produtos (categoria);
create index if not exists idx_pedidos_cliente on public.pedidos (cliente_id);
create index if not exists idx_pedidos_tecnico on public.pedidos (tecnico_id);
create index if not exists idx_pedidos_status on public.pedidos (status);
create index if not exists idx_pedidos_data_instalacao on public.pedidos (data_instalacao);
create index if not exists idx_pedidos_created_at on public.pedidos (created_at);
create index if not exists idx_itens_pedido on public.itens_pedido (pedido_id);
create index if not exists idx_itens_produto on public.itens_pedido (produto_id);
create index if not exists idx_historico_pedido on public.historico_status (pedido_id, alterado_em);
