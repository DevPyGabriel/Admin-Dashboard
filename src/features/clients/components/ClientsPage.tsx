import { useState } from 'react'
import { format } from 'date-fns'
import { UsersRound } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Client } from '@/features/clients/api/clients.api'
import { ClientFormDialog } from '@/features/clients/components/ClientFormDialog'
import { useClients, useDeleteClient } from '@/features/clients/hooks/useClients'
import { cn } from '@/lib/utils/cn'

interface Notice {
  text: string
  tone: 'success' | 'danger'
}

export default function ClientsPage() {
  const { data: clients = [], isLoading, error } = useClients()
  const deleteClient = useDeleteClient()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (client: Client) => {
    setEditing(client)
    setDialogOpen(true)
  }

  const handleDelete = async (client: Client) => {
    if (!window.confirm(`¿Eliminar a "${client.full_name}"?`)) return

    setNotice(null)
    try {
      await deleteClient.mutateAsync(client.id)
      setNotice({ text: 'Cliente eliminado correctamente.', tone: 'success' })
    } catch (deleteError) {
      setNotice({
        text: deleteError instanceof Error ? deleteError.message : 'No se pudo eliminar el cliente',
        tone: 'danger',
      })
    }
  }

  const statusBadge = (client: Client) => (
    <Badge
      className={cn(
        'border-transparent',
        client.status === 'active'
          ? 'bg-success-soft text-success-soft-foreground'
          : 'bg-surface-muted text-muted-foreground',
      )}
    >
      {client.status}
    </Badge>
  )

  return (
    <main className="page-container py-6 sm:py-8">
      <div className="space-y-6">
        <PageHeader
          title="Clientes"
          description="Administra los clientes de tu negocio y su estado."
          actions={
            <Button size="sm" className="w-full sm:w-auto" onClick={openCreate}>
              Nuevo cliente
            </Button>
          }
        />

        {notice && (
          <p
            role="status"
            className={cn('text-sm', notice.tone === 'danger' ? 'text-danger' : 'text-success')}
          >
            {notice.text}
          </p>
        )}
        {error && (
          <p className="text-danger text-sm" role="alert">
            {error.message}
          </p>
        )}

        <section className="surface-panel overflow-hidden" aria-label="Listado de clientes">
          <div className="border-border flex items-center justify-between border-b px-4 py-3">
            <h2 className="text-sm font-semibold">Listado</h2>
            <span className="text-muted-foreground tabular-data text-xs">
              {clients.length} {clients.length === 1 ? 'registro' : 'registros'}
            </span>
          </div>

          {isLoading ? (
            <p className="text-muted-foreground p-6 text-sm">Cargando…</p>
          ) : clients.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-14 text-center">
              <UsersRound className="text-muted-foreground size-5" aria-hidden="true" />
              <p className="mt-3 text-sm font-medium">Aún no hay clientes</p>
              <p className="text-muted-foreground mt-1 text-xs">
                Crea el primero con «Nuevo cliente».
              </p>
            </div>
          ) : (
            <>
              {/* Phone: one card per client, with the actions inside thumb reach. */}
              <ul className="divide-border divide-y md:hidden">
                {clients.map((client) => (
                  <li key={client.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{client.full_name}</p>
                        <p className="text-muted-foreground truncate text-xs">{client.email}</p>
                      </div>
                      {statusBadge(client)}
                    </div>
                    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                      <div className="min-w-0">
                        <dt className="text-muted-foreground">Teléfono</dt>
                        <dd className="tabular-data truncate">{client.phone ?? '—'}</dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-muted-foreground">Creado</dt>
                        <dd className="tabular-data">
                          {format(new Date(client.created_at), 'dd/MM/yyyy')}
                        </dd>
                      </div>
                    </dl>
                    <div className="mt-3 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openEdit(client)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive flex-1"
                        onClick={() => void handleDelete(client)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Desktop: dense table, same data and the same handlers. */}
              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Creado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.full_name}</TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell>{client.phone ?? '—'}</TableCell>
                        <TableCell>{statusBadge(client)}</TableCell>
                        <TableCell className="tabular-data">
                          {format(new Date(client.created_at), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell className="space-x-2 text-right">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(client)}>
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => void handleDelete(client)}
                          >
                            Eliminar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </section>
      </div>

      {dialogOpen && (
        <ClientFormDialog
          key={editing?.id ?? 'new'}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          client={editing}
        />
      )}
    </main>
  )
}
