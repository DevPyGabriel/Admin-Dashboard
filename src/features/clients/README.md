# Clients feature

Customer CRUD used to verify the Supabase connection end to end.

- `components/` — `ClientsPage` table and `ClientFormDialog`
- `hooks/` — `useClients`, `useCreateClient`, `useUpdateClient`, `useDeleteClient`
- `api/` — typed Supabase queries keyed by `Database['public']['Tables']['clients']`
- `schemas/` — Zod validation for the client form
- `types/` — feature-local types (reserved)

Rows are read/written through RLS as an authenticated operator. Use
`supabase/seed.test.sql` to create clearly prefixed `TEST_` demo data.
