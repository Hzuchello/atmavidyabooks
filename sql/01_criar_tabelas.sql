-- ============================================
-- ÁTMA VIDYÁ — Criação das tabelas iniciais
-- ============================================

-- Tabela de livros
create table livros (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  autor text not null,
  categorias text[] not null default '{}',
  preco_centavos integer,              -- nulo = ainda sem preço definido | 0 = gratuito | >0 = preço normal
  capa_url text,
  tipo_venda text not null default 'proprio' check (tipo_venda in ('proprio', 'externo')),
  link_externo text,                   -- só usado quando tipo_venda = 'externo'
  stripe_price_id text,                -- só usado quando tipo_venda = 'proprio' (preenchido na etapa Stripe)
  disponivel boolean not null default true,
  criado_em timestamptz not null default now()
);

-- Tabela de pedidos (usada quando o Stripe entrar)
create table pedidos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references auth.users(id),
  status text not null default 'pendente' check (status in ('pendente', 'pago', 'cancelado')),
  total_centavos integer not null default 0,
  criado_em timestamptz not null default now()
);

-- Tabela de itens de cada pedido
create table itens_pedido (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references pedidos(id) on delete cascade,
  livro_id uuid not null references livros(id),
  quantidade integer not null default 1,
  preco_unitario_centavos integer not null,
  criado_em timestamptz not null default now()
);

-- ============================================
-- Segurança (RLS) — necessário porque ativamos
-- "Enable automatic RLS" na criação do projeto.
-- Sem isso, NINGUÉM conseguiria ler os livros
-- no site, nem visitantes anônimos.
-- ============================================

alter table livros enable row level security;
alter table pedidos enable row level security;
alter table itens_pedido enable row level security;

-- Qualquer pessoa (inclusive visitante não logado) pode VER o catálogo
create policy "Catálogo é público para leitura"
  on livros for select
  using (true);

-- Só o próprio usuário logado pode ver seus pedidos
create policy "Usuário vê apenas seus próprios pedidos"
  on pedidos for select
  using (auth.uid() = usuario_id);

-- Só o próprio usuário logado pode ver os itens dos seus pedidos
create policy "Usuário vê apenas itens dos seus próprios pedidos"
  on itens_pedido for select
  using (
    exists (
      select 1 from pedidos
      where pedidos.id = itens_pedido.pedido_id
      and pedidos.usuario_id = auth.uid()
    )
  );

-- Observação: não criamos políticas de INSERT/UPDATE ainda de propósito.
-- Isso será feito na etapa do Stripe, quando definirmos exatamente
-- como um pedido é criado (via function serverless, não direto pelo navegador).
