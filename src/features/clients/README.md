# Clients feature

Client services dashboard backed by `clients` + `subscriptions` + `payments`.

- `components/` — `ClientsPage` (stats, filters, countdown, states) and `ClientFormDialog`
- `hooks/` — service queries and mutations, including payment registration
- `api/` — typed Supabase queries; a joined service row drives the UI
- `lib/` — state, countdown, filter and sort helpers (pure, testable)
- `schemas/` — Zod validation for the service form

## Data model

The form stores the client name and optional email on `clients`, and the service
type, optional due date, amount and optional description on `subscriptions`.
Payments remain on `payments`, so RLS and history are unchanged.

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
date. Quick filters, search by client/service/state, exact due-date filtering
and four sort modes are available above the table.

Rows are read/written through RLS as an authenticated operator. Use
`supabase/seed.test.sql` to create clearly prefixed `TEST_` demo data.
