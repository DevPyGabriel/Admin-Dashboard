-- Client form now captures the service record directly.
-- The existing clients/subscriptions/payments model is reused so RLS, payment
-- history and reminders keep working without a parallel table.

alter table public.clients
  alter column email drop not null;

alter table public.subscriptions
  alter column next_billing_date drop not null,
  alter column billing_cycle set default 'monthly',
  add column if not exists description text;

alter table public.payments
  add column if not exists billing_date date;

comment on column public.subscriptions.plan_name is 'Tipo de servicio contratado.';
comment on column public.subscriptions.next_billing_date is 'Fecha de corte opcional del servicio.';
comment on column public.subscriptions.description is 'Descripción opcional del servicio.';
comment on column public.payments.billing_date is 'Ciclo de facturación al que corresponde el pago.';

-- Existing payments belonged to the subscription's current due date.
update public.payments p
   set billing_date = s.next_billing_date
  from public.subscriptions s
 where s.id = p.subscription_id
   and p.billing_date is null;

-- Null due dates are valid now, so keep them out of the reminder index.
drop index if exists public.subscriptions_due_idx;
create index subscriptions_due_idx
  on public.subscriptions (next_billing_date)
  where status = 'active' and auto_remind and next_billing_date is not null;

create index if not exists payments_subscription_cycle_idx
  on public.payments (subscription_id, billing_date)
  where status = 'paid';
