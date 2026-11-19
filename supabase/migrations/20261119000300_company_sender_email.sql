-- Reminder emails are sent through Resend from an Edge Function. The browser
-- only stores the sender address here; the API key stays in Supabase Secrets.
alter table public.company_settings
  add column if not exists sender_email text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'company_settings_sender_email_check'
      and conrelid = 'public.company_settings'::regclass
  ) then
    alter table public.company_settings
      add constraint company_settings_sender_email_check
      check (
        sender_email is null
        or sender_email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
      );
  end if;
end $$;

comment on column public.company_settings.sender_email is
  'Verified Resend sender address used as the From header for reminders';
