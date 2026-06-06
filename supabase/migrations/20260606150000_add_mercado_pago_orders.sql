-- Migration: integração Mercado Pago (Checkout Pro)

alter table public.orders
  add column if not exists mp_preference_id text,
  add column if not exists mp_payment_id text,
  add column if not exists payment_status text not null default 'pending'
    check (payment_status in ('pending', 'approved', 'rejected', 'cancelled', 'in_process'));

create index if not exists idx_orders_mp_preference on public.orders(mp_preference_id);
create index if not exists idx_orders_mp_payment on public.orders(mp_payment_id);
create index if not exists idx_orders_payment_status on public.orders(payment_status);
