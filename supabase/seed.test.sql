-- Datos de prueba para el proyecto actual de NovaDrive Dashboard.
-- NO ejecutar en un proyecto de producción real sin antes crear el operador.
--
-- Paso previo en el Dashboard:
--   Authentication -> Add user -> test.operator@example.com / contraseña segura
--
-- Ejecuta este script en SQL Editor. Usa el prefijo TEST_ para identificar y
-- limpiar fácilmente las filas de prueba al terminar.

insert into public.company_settings (company_name, support_email)
values ('NovaDrive Dashboard - Test', 'test.operator@example.com')
on conflict (id) do nothing;

insert into public.operators (user_id, role)
select id, 'operator'
from auth.users
where email = 'test.operator@example.com'
on conflict do nothing;

insert into public.clients (full_name, email, phone, tax_id)
values
  ('TEST - Cliente A', 'test.cliente.a@example.com', '+1 555 0001', 'TEST-001'),
  ('TEST - Cliente B', 'test.cliente.b@example.com', '+1 555 0002', 'TEST-002')
on conflict (email) do nothing;

insert into public.subscriptions (
  client_id, plan_name, amount, currency, billing_cycle, next_billing_date
)
select
  id,
  'TEST - Plan Mensual',
  29.00,
  'USD',
  'monthly',
  current_date + 7
from public.clients c
where c.email in ('test.cliente.a@example.com', 'test.cliente.b@example.com')
  and not exists (
    select 1
    from public.subscriptions s
    where s.client_id = c.id
      and s.plan_name = 'TEST - Plan Mensual'
  );

-- Limpieza al terminar las pruebas (descomentar y ejecutar):
-- delete from public.clients where email like 'test.cliente.%@example.com';
-- delete from public.operators where user_id in (
--   select id from auth.users where email = 'test.operator@example.com'
-- );
