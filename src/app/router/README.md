# Router

`router.tsx` owns the browser route tree.

- `/login` is public.
- `/clients` is the working CRUD screen.
- `/subscriptions`, `/payments`, `/reminders` and `/settings` are authenticated
  placeholder routes that render `PlaceholderPage`.
- Unknown paths redirect to `/clients`.

Every authenticated route is wrapped in `RequireAuth` and `DashboardLayout`, so
the shell and its mobile drawer are shared by all screens. Register new feature
routes here as they are implemented.
