-- Core schema for the subscription admin (single-tenant).
-- Plan name is stored as plain text on each subscription; no plans catalog.

create type public.billing_cycle as enum ('monthly', 'quarterly', 'annual');
create type public.client_status as enum ('active', 'inactive');
create type public.subscription_status as enum ('active', 'paused', 'cancelled');
create type public.payment_status as enum ('pending', 'paid', 'failed');
create type public.reminder_kind as enum ('upcoming_charge', 'payment_due');

-- Singleton company configuration (exactly one row: id = true).
create table public.company_settings (
  id boolean primary key default true check (id),
  company_name text not null,
  support_email text not null,
  currency text not null default 'USD',
  timezone text not null default 'UTC',
  reminder_days_before integer not null default 3
    check (reminder_days_before between 1 and 30),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Operators: links Supabase Auth users with the admin dashboard.
create table public.operators (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'operator'
    check (role in ('owner', 'operator')),
  created_at timestamptz not null default now()
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  phone text,
  tax_id text,
  status public.client_status not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  plan_name text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  currency text not null default 'USD',
  billing_cycle public.billing_cycle not null,
  start_date date not null default current_date,
  next_billing_date date not null,
  status public.subscription_status not null default 'active',
  auto_remind boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index subscriptions_due_idx on public.subscriptions (next_billing_date)
  where status = 'active' and auto_remind;

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null
    references public.subscriptions(id) on delete cascade,
  amount numeric(12, 2) not null check (amount >= 0),
  paid_at date not null default current_date,
  status public.payment_status not null default 'paid',
  method text,
  external_reference text,
  created_at timestamptz not null default now()
);

-- Idempotency: one reminder per subscription/type/billing date.
create table public.reminder_logs (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null
    references public.subscriptions(id) on delete cascade,
  reminder_type public.reminder_kind not null,
  billing_date date not null,
  status text not null check (status in ('sent', 'failed', 'skipped')),
  provider_id text,
  error text,
  sent_at timestamptz not null default now(),
  unique (subscription_id, reminder_type, billing_date)
);

-- updated_at maintenance
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger clients_touch before update on public.clients
  for each row execute function public.touch_updated_at();
create trigger subscriptions_touch before update on public.subscriptions
  for each row execute function public.touch_updated_at();
create trigger settings_touch before update on public.company_settings
  for each row execute function public.touch_updated_at();

-- RLS helper. SECURITY DEFINER avoids recursion on public.operators.
create or replace function public.is_operator()
returns boolean language sql stable security definer
set search_path = public as $$
  select exists (
    select 1 from public.operators where user_id = auth.uid()
  );
$$;

revoke all on function public.is_operator() from public;
grant execute on function public.is_operator() to authenticated;

do $$
declare t text;
begin
  foreach t in array array[
    'company_settings', 'clients', 'subscriptions', 'payments', 'reminder_logs'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format($p$
      create policy operator_access on public.%I
      for all to authenticated
      using (public.is_operator())
      with check (public.is_operator())
    $p$, t);
  end loop;
end $$;

alter table public.operators enable row level security;
create policy own_operator_row on public.operators
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
