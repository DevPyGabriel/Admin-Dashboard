-- Edge Functions use the service_role key to read settings and write reminder
-- logs without an end-user session. This project was configured without the
-- default Data API grants, so the role needs explicit table privileges.
grant select, insert, update, delete on
  public.company_settings,
  public.clients,
  public.subscriptions,
  public.payments,
  public.reminder_logs,
  public.operators
to service_role;
