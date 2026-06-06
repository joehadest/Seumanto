-- Migration: schema inicial Maykeloja (products + orders)

create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text default '',
  price       numeric(10,2) not null default 0,
  sizes       text[] not null default '{}',
  colors      text[] not null default '{}',
  stock       integer not null default 0,
  image_url   text default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.orders (
  id          uuid primary key default gen_random_uuid(),
  customer    jsonb not null,
  items       jsonb not null,
  total       numeric(10,2) not null default 0,
  status      text not null default 'Pendente'
              check (status in ('Pendente','Pago','Enviado','Cancelado')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_products_updated on public.products;
create trigger trg_products_updated before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists trg_orders_updated on public.orders;
create trigger trg_orders_updated before update on public.orders
  for each row execute function public.set_updated_at();

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'products'
  ) then
    alter publication supabase_realtime add table public.products;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table public.orders;
  end if;
end;
$$;

alter table public.products enable row level security;
alter table public.orders enable row level security;

drop policy if exists "products_read" on public.products;
drop policy if exists "products_write" on public.products;
create policy "products_read" on public.products for select using (true);
create policy "products_write" on public.products for all using (true) with check (true);

drop policy if exists "orders_read" on public.orders;
drop policy if exists "orders_insert" on public.orders;
drop policy if exists "orders_update" on public.orders;
create policy "orders_read" on public.orders for select using (true);
create policy "orders_insert" on public.orders for insert with check (true);
create policy "orders_update" on public.orders for update using (true) with check (true);

insert into public.products (name, description, price, sizes, colors, stock, image_url)
select *
from (
  values
    ('Camiseta Classica Preta', 'Algodao 100%, corte regular, perfeita para o dia a dia.', 79.90, array['P','M','G','GG'], array['Preto'], 40, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80'),
    ('Camiseta Basica Branca', 'Tecido leve e respiravel, ideal para qualquer ocasiao.', 69.90, array['P','M','G'], array['Branco'], 25, 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&q=80'),
    ('Camiseta Oversized Cinza', 'Modelagem ampla streetwear, super confortavel.', 99.90, array['M','G','GG'], array['Cinza','Preto'], 15, 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80'),
    ('Camiseta Premium Azul', 'Fio penteado de alta gramatura, toque macio.', 119.90, array['P','M','G','GG'], array['Azul Marinho'], 30, 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80')
) as seed(name, description, price, sizes, colors, stock, image_url)
where not exists (
  select 1 from public.products p where p.name = seed.name
);
-- Migration: schema inicial Maykeloja (products + orders)

create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text default '',
  price       numeric(10,2) not null default 0,
  sizes       text[] not null default '{}',
  colors      text[] not null default '{}',
  stock       integer not null default 0,
  image_url   text default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.orders (
  id          uuid primary key default gen_random_uuid(),
  customer    jsonb not null,
  items       jsonb not null,
  total       numeric(10,2) not null default 0,
  status      text not null default 'Pendente'
              check (status in ('Pendente','Pago','Enviado','Cancelado')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_products_updated on public.products;
create trigger trg_products_updated before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists trg_orders_updated on public.orders;
create trigger trg_orders_updated before update on public.orders
  for each row execute function public.set_updated_at();

alter publication supabase_realtime add table public.products;
alter publication supabase_realtime add table public.orders;

alter table public.products enable row level security;
alter table public.orders   enable row level security;

drop policy if exists "products_read"  on public.products;
drop policy if exists "products_write" on public.products;
create policy "products_read"  on public.products for select using (true);
create policy "products_write" on public.products for all    using (true) with check (true);

drop policy if exists "orders_read"   on public.orders;
drop policy if exists "orders_insert" on public.orders;
drop policy if exists "orders_update" on public.orders;
create policy "orders_read"   on public.orders for select using (true);
create policy "orders_insert" on public.orders for insert with check (true);
create policy "orders_update" on public.orders for update using (true) with check (true);

insert into public.products (name, description, price, sizes, colors, stock, image_url) values
  ('Camiseta Classica Preta', 'Algodao 100%, corte regular, perfeita para o dia a dia.', 79.90, '{P,M,G,GG}', '{Preto}', 40, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80'),
  ('Camiseta Basica Branca', 'Tecido leve e respiravel, ideal para qualquer ocasiao.', 69.90, '{P,M,G}', '{Branco}', 25, 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&q=80'),
  ('Camiseta Oversized Cinza', 'Modelagem ampla streetwear, super confortavel.', 99.90, '{M,G,GG}', '{Cinza,Preto}', 15, 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80'),
  ('Camiseta Premium Azul', 'Fio penteado de alta gramatura, toque macio.', 119.90, '{P,M,G,GG}', '{"Azul Marinho"}', 30, 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80');
