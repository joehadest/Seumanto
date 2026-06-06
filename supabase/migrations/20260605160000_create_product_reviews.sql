-- Migration: avaliações públicas de produtos

create table if not exists public.product_reviews (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products(id) on delete cascade,
  customer_name text not null default 'Cliente Seu manto',
  rating        integer not null check (rating between 1 and 5),
  comment       text not null check (char_length(trim(comment)) > 0),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_product_reviews_product_id
  on public.product_reviews(product_id);

create index if not exists idx_product_reviews_created_at
  on public.product_reviews(created_at desc);

drop trigger if exists trg_product_reviews_updated on public.product_reviews;
create trigger trg_product_reviews_updated before update on public.product_reviews
  for each row execute function public.set_updated_at();

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'product_reviews'
  ) then
    alter publication supabase_realtime add table public.product_reviews;
  end if;
end;
$$;

alter table public.product_reviews enable row level security;

drop policy if exists "product_reviews_read" on public.product_reviews;
drop policy if exists "product_reviews_insert" on public.product_reviews;
drop policy if exists "product_reviews_admin_update" on public.product_reviews;
drop policy if exists "product_reviews_admin_delete" on public.product_reviews;

-- Clientes podem ver avaliações aprovadas/registradas publicamente.
create policy "product_reviews_read"
on public.product_reviews
for select
to anon, authenticated
using (true);

-- A loja pública permite avaliar produtos sem login.
create policy "product_reviews_insert"
on public.product_reviews
for insert
to anon, authenticated
with check (
  rating between 1 and 5
  and char_length(trim(comment)) > 0
  and char_length(trim(customer_name)) > 0
);

-- Admin pode moderar/excluir avaliações.
create policy "product_reviews_admin_update"
on public.product_reviews
for update
to authenticated
using (
  (auth.jwt() ->> 'role') = 'admin'
  or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  (auth.jwt() ->> 'role') = 'admin'
  or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "product_reviews_admin_delete"
on public.product_reviews
for delete
to authenticated
using (
  (auth.jwt() ->> 'role') = 'admin'
  or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
