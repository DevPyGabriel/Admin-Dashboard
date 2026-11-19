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

insert into public.clients (full_name, email)
values
  ('TEST - Cliente pagado', 'test.cliente.pagado@example.com'),
  ('TEST - Cliente pendiente', 'test.cliente.pendiente@example.com'),
  ('TEST - Cliente por cobrar', 'test.cliente.cobrar@example.com')
on conflict (email) do nothing;

insert into public.subscriptions (
  client_id, plan_name, amount, currency, billing_cycle,
  next_billing_date, description
)
select
  c.id,
  'TEST - Plan Mensual',
  29.00,
  'USD',
  'monthly',
  case c.email
    when 'test.cliente.cobrar@example.com' then current_date - 3
    else current_date + 7
  end,
  'Servicio de prueba para verificar estados'
from public.clients c
where c.email in (
  'test.cliente.pagado@example.com',
  'test.cliente.pendiente@example.com',
  'test.cliente.cobrar@example.com'
)
  and not exists (
    select 1
    from public.subscriptions s
    where s.client_id = c.id
      and s.plan_name = 'TEST - Plan Mensual'
  );

insert into public.payments (subscription_id, amount, billing_date, status)
select s.id, s.amount, s.next_billing_date, 'paid'
from public.subscriptions s
join public.clients c on c.id = s.client_id
where c.email = 'test.cliente.pagado@example.com'
  and s.plan_name = 'TEST - Plan Mensual'
  and not exists (
    select 1 from public.payments p where p.subscription_id = s.id
  );

-- Limpieza al terminar las pruebas (descomentar y ejecutar):
-- delete from public.clients where email like 'test.cliente.%@example.com';
-- delete from public.operators where user_id in (
--   select id from auth.users where email = 'test.operator@example.com'
-- );
