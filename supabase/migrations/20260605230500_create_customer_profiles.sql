-- Migration: area logada do cliente (profiles + pedidos por usuario)

create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text not null default '',
  phone      text not null default '',
  address    jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, phone, address)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    '{}'::jsonb
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.orders
  add column if not exists user_id uuid references public.profiles(id) on delete set null;

create index if not exists idx_orders_user_id on public.orders(user_id);

alter table public.orders
  drop constraint if exists orders_status_check;

alter table public.orders
  add constraint orders_status_check
  check (status in ('Pendente','Pago','Enviado','Entregue','Cancelado'));

alter table public.profiles enable row level security;

drop policy if exists "profiles_own_read" on public.profiles;
drop policy if exists "profiles_own_insert" on public.profiles;
drop policy if exists "profiles_own_update" on public.profiles;
drop policy if exists "profiles_admin_read" on public.profiles;

create policy "profiles_own_read"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "profiles_own_insert"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "profiles_own_update"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "profiles_admin_read"
on public.profiles
for select
to authenticated
using (
  (auth.jwt() ->> 'role') = 'admin'
  or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

drop policy if exists "orders_insert" on public.orders;
drop policy if exists "orders_customer_read" on public.orders;
drop policy if exists "orders_customer_insert" on public.orders;

create policy "orders_customer_insert"
on public.orders
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "orders_customer_read"
on public.orders
for select
to authenticated
using (auth.uid() = user_id);
