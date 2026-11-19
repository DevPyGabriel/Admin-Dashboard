# Notifications feature

Automated email notification configuration and history.

- `components/` — notification-specific components
- `hooks/` — notification data hooks
- `services/` — Edge Function invocation helpers
- `types/` — notification domain types

Actual email delivery is handled by Supabase Edge Functions with Resend; no
credentials or delivery logic belong in this frontend feature.
