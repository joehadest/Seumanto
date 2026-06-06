-- Migration: configuracoes gerais da loja

create table if not exists public.store_settings (
  id uuid primary key default gen_random_uuid(),
  store_name text not null default 'Seu manto',
  maintenance_mode boolean not null default false,
  contact_info jsonb not null default '{"email":"","phone":"","address":""}'::jsonb,
  shipping_rules jsonb not null default '{"freeShippingMinAmount":0,"flatRate":0}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_store_settings_updated on public.store_settings;
create trigger trg_store_settings_updated before update on public.store_settings
  for each row execute function public.set_updated_at();

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'store_settings'
  ) then
    alter publication supabase_realtime add table public.store_settings;
  end if;
end;
$$;

alter table public.store_settings enable row level security;

drop policy if exists "store_settings_read" on public.store_settings;
drop policy if exists "store_settings_admin_insert" on public.store_settings;
drop policy if exists "store_settings_admin_update" on public.store_settings;
drop policy if exists "store_settings_admin_delete" on public.store_settings;

-- Leitura publica: a loja precisa saber nome, contato, frete e maintenance_mode.
create policy "store_settings_read"
on public.store_settings
for select
using (true);

-- Escrita apenas para administradores. O projeto deve emitir role=admin no JWT.
-- Mantemos tambem app_metadata.role=admin para compatibilidade com Supabase Auth.
create policy "store_settings_admin_insert"
on public.store_settings
for insert
to authenticated
with check (
  (auth.jwt() ->> 'role') = 'admin'
  or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "store_settings_admin_update"
on public.store_settings
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

create policy "store_settings_admin_delete"
on public.store_settings
for delete
to authenticated
using (
  (auth.jwt() ->> 'role') = 'admin'
  or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

insert into public.store_settings (
  store_name,
  maintenance_mode,
  contact_info,
  shipping_rules
)
select
  'Seu manto',
  false,
  '{"email":"contato@maykeloja.com","phone":"","address":""}'::jsonb,
  '{"freeShippingMinAmount":199.90,"flatRate":19.90}'::jsonb
where not exists (select 1 from public.store_settings);
