-- Migration: endurece RLS das areas administrativas

-- Helper inline usado nas policies:
-- admin = JWT com role=admin ou app_metadata.role=admin.

drop policy if exists "products_write" on public.products;
drop policy if exists "products_admin_insert" on public.products;
drop policy if exists "products_admin_update" on public.products;
drop policy if exists "products_admin_delete" on public.products;

create policy "products_admin_insert"
on public.products
for insert
to authenticated
with check (
  (auth.jwt() ->> 'role') = 'admin'
  or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "products_admin_update"
on public.products
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

create policy "products_admin_delete"
on public.products
for delete
to authenticated
using (
  (auth.jwt() ->> 'role') = 'admin'
  or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

drop policy if exists "orders_read" on public.orders;
drop policy if exists "orders_update" on public.orders;
drop policy if exists "orders_admin_read" on public.orders;
drop policy if exists "orders_admin_update" on public.orders;
drop policy if exists "orders_admin_delete" on public.orders;

-- Checkout continua publico.
drop policy if exists "orders_insert" on public.orders;
create policy "orders_insert"
on public.orders
for insert
to anon, authenticated
with check (true);

-- Admin gerencia pedidos.
create policy "orders_admin_read"
on public.orders
for select
to authenticated
using (
  (auth.jwt() ->> 'role') = 'admin'
  or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "orders_admin_update"
on public.orders
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

create policy "orders_admin_delete"
on public.orders
for delete
to authenticated
using (
  (auth.jwt() ->> 'role') = 'admin'
  or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
