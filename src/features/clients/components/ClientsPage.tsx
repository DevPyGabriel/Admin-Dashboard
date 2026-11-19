import { useState } from 'react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuthSession } from '@/features/auth/hooks/useAuthSession'
import type { Client } from '@/features/clients/api/clients.api'
import { ClientFormDialog } from '@/features/clients/components/ClientFormDialog'
import { useClients, useDeleteClient } from '@/features/clients/hooks/useClients'
import { supabase } from '@/lib/supabase/client'

export default function ClientsPage() {
  const { data: clients = [], isLoading, error } = useClients()
  const deleteClient = useDeleteClient()
  const { user } = useAuthSession()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

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
      setNotice('Cliente eliminado correctamente.')
    } catch (deleteError) {
      setNotice(
        deleteError instanceof Error ? deleteError.message : 'No se pudo eliminar el cliente',
      )
    }
  }

  return (
    <main className="page-container space-y-6 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground text-sm">
            Prueba de lectura, creación, edición y borrado contra Supabase.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground hidden text-xs sm:inline">{user?.email}</span>
          <Button variant="outline" onClick={() => void supabase.auth.signOut()}>
            Salir
          </Button>
          <Button onClick={openCreate}>Nuevo cliente</Button>
        </div>
      </header>

      {notice && <p className="text-muted-foreground text-sm">{notice}</p>}
      {error && (
        <p className="text-destructive text-sm" role="alert">
          {error.message}
        </p>
      )}

      <Card className="surface-panel">
        <CardHeader>
          <CardTitle>Listado</CardTitle>
          <CardDescription>
            {clients.length} {clients.length === 1 ? 'registro' : 'registros'} en la tabla{' '}
            <code>public.clients</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Cargando…</p>
          ) : clients.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No hay clientes. Crea uno con el botón «Nuevo cliente».
            </p>
          ) : (
            <div className="overflow-x-auto">
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
                      <TableCell>
                        <Badge
                          className={
                            client.status === 'active'
                              ? 'bg-success-soft text-success-soft-foreground border-transparent'
                              : 'bg-surface-muted text-muted-foreground border-transparent'
                          }
                        >
                          {client.status}
                        </Badge>
                      </TableCell>
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
          )}
        </CardContent>
      </Card>

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
