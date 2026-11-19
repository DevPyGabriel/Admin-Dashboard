-- The support email configured in the settings page always receives a copy of
-- every reminder. This list holds additional operator inboxes.
alter table public.company_settings
  add column if not exists operator_emails text[] not null default '{}';

comment on column public.company_settings.operator_emails is
  'Additional operator inboxes that receive a copy of every reminder.';
