# Clients feature

Client services dashboard backed by `clients` + `subscriptions` + `payments`.

- `components/` — `ClientsPage` (stats, filters, countdown, states) and `ClientFormDialog`
- `hooks/` — service queries and mutations, including payment registration
- `api/` — typed Supabase queries; a joined service row drives the UI
- `lib/` — state, countdown, filter and sort helpers (pure, testable)
- `schemas/` — Zod validation for the service form

## Data model

The form stores the client name and optional email on `clients`, and any number
of services on `subscriptions`; each service has its own type, amount, optional
due date and optional description. `save_client_with_services` writes the client
and all of its services in one transaction, so adding or removing rows from the
form cannot leave a partial save. Payments remain on `payments`, so RLS and
history are unchanged. The list groups services by client and offers **Agregar
servicio** both in the form and as a quick action on each client. Each service
row also has **Eliminar**, which removes only that subscription (and its
cascaded payments/reminders) without opening the form. The last service of a
client cannot be removed this way; use **Eliminar cliente** instead.

| Label en la UI       | Columna                                                      |
| -------------------- | ------------------------------------------------------------ |
| Nombre del cliente   | `clients.full_name`                                          |
| Correo electrónico   | `clients.email` (nullable)                                   |
| Tipo de servicio     | `subscriptions.plan_name` (`transporte`, `taxi`, `delivery`) |
| Monto                | `subscriptions.amount`                                       |
| Fecha de vencimiento | `subscriptions.next_billing_date` (nullable)                 |
| Descripción          | `subscriptions.description`                                  |

## States

- **Pagado** — existe un pago con `status = 'paid'` para el ciclo vigente.
- **Pendiente** — sin pago y la fecha de corte aún no llega (o no hay fecha).
- **Por cobrar** — sin pago y la fecha de corte ya llegó.
- **Sin pagar** — une pendientes y por cobrar.

The default sort is priority (`por cobrar` → `pendiente` → `pagado`), then due
date. Quick filters, search by client/service/state and four sort modes are
available above the table.

Rows are read/written through RLS as an authenticated operator. Use
`supabase/seed.test.sql` to create clearly prefixed `TEST_` demo data.
