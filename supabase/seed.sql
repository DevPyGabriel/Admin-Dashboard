-- Local development data only. Never use --include-seed on production.

-- Placeholder Auth user used only as a foreign key for public.operators.
-- It has no password; create a real login-capable user from local Studio or
-- the Auth admin API when you need to sign in.
insert into auth.users (id, email, raw_user_meta_data)
values ('d0e3c8f0-1234-5678-9abc-def012345678', 'admin@example.com', '{}');

insert into public.operators (user_id, role)
values ('d0e3c8f0-1234-5678-9abc-def012345678', 'owner');

insert into public.company_settings (company_name, support_email, currency, timezone)
values ('Demo Company', 'admin@example.com', 'USD', 'UTC');

insert into public.clients (id, full_name, email, phone, tax_id)
values
  ('11111111-1111-4111-8111-111111111111', 'Jane Doe', 'jane@example.com', '+1 555 0100', 'TAX-001'),
  ('22222222-2222-4222-8222-222222222222', 'John Smith', 'john@example.com', '+1 555 0101', 'TAX-002');

insert into public.subscriptions (
  id, client_id, plan_name, amount, currency, billing_cycle,
  start_date, next_billing_date
)
values
  (
    '33333333-3333-4333-8333-333333333333',
    '11111111-1111-4111-8111-111111111111',
    'Plan Básico', 29.00, 'USD', 'monthly',
    current_date - 15, current_date + 5
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    '22222222-2222-4222-8222-222222222222',
    'Plan Anual', 290.00, 'USD', 'annual',
    current_date - 30, current_date + 20
  );

insert into public.payments (subscription_id, amount, paid_at, status, method)
values
  (
    '33333333-3333-4333-8333-333333333333',
    29.00, current_date - 25, 'paid', 'card'
  );
