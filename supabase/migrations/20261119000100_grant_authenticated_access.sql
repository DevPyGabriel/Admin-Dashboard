-- Supabase projects can be configured without default table grants for the
-- Data API roles. The browser client uses the `authenticated` role, so explicit
-- grants are required in addition to RLS policies.
--
-- RLS remains enabled: these grants only allow Postgres to evaluate the
-- policies; they do not bypass them.

do $$
declare t text;
begin
  foreach t in array array[
    'company_settings',
    'clients',
    'operators',
    'payments',
    'reminder_logs',
    'subscriptions'
  ] loop
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;
