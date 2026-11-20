-- WhatsApp reminders show each USD amount alongside its bolívar equivalent,
-- using the rate configured by the operator in the settings panel.
alter table public.company_settings
  add column if not exists bs_exchange_rate numeric not null default 0;

alter table public.company_settings
  drop constraint if exists company_settings_bs_exchange_rate_check;

alter table public.company_settings
  add constraint company_settings_bs_exchange_rate_check
  check (bs_exchange_rate >= 0);

comment on column public.company_settings.bs_exchange_rate is
  'Bolívares per 1 USD, used for the equivalent amount in WhatsApp reminders';
