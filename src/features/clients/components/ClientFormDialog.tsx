import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { ClientService } from '@/features/clients/api/clients.api'
import { useCreateClientService, useUpdateClientService } from '@/features/clients/hooks/useClients'
import { clientSchema, type ClientFormValues } from '@/features/clients/schemas/client.schema'

interface ClientFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  service: ClientService | null
}

export function ClientFormDialog({ open, onOpenChange, service }: ClientFormDialogProps) {
  const [error, setError] = useState<string | null>(null)
  const createService = useCreateClientService()
  const updateService = useUpdateClientService()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      full_name: service?.clientName ?? '',
      email: service?.email ?? '',
      service_type: service?.serviceType ?? '',
      amount: service?.amount ?? 0,
      due_date: service?.dueDate ?? '',
      description: service?.description ?? '',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setError(null)

    try {
      if (service) {
        await updateService.mutateAsync({
          clientId: service.clientId,
          subscriptionId: service.id,
          values,
        })
      } else {
        await createService.mutateAsync(values)
      }
      onOpenChange(false)
    } catch (mutationError) {
      setError(
        mutationError instanceof Error ? mutationError.message : 'No se pudo guardar el cliente',
      )
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="py-8 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{service ? 'Editar cliente' : 'Nuevo cliente'}</DialogTitle>
          <DialogDescription className="pt-2 pb-2 text-xs">
            Los cambios se guardan directamente en Supabase y se reflejan al instante.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="full_name">Nombre del cliente</Label>
            <Input
              id="full_name"
              autoComplete="name"
              aria-invalid={!!errors.full_name}
              {...register('full_name')}
            />
            {errors.full_name && (
              <p className="text-destructive text-xs">{errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Correo electrónico{' '}
              <span className="text-muted-foreground font-normal">(opcional)</span>
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              {...register('email')}
            />
            {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="service_type">Tipo de servicio</Label>
              <Input
                id="service_type"
                placeholder="Ej. Plan Pro mensual"
                aria-invalid={!!errors.service_type}
                {...register('service_type')}
              />
              {errors.service_type && (
                <p className="text-destructive text-xs">{errors.service_type.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Monto</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                aria-invalid={!!errors.amount}
                {...register('amount', { valueAsNumber: true })}
              />
              {errors.amount && <p className="text-destructive text-xs">{errors.amount.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="due_date">
              Fecha de vencimiento{' '}
              <span className="text-muted-foreground font-normal">(opcional)</span>
            </Label>
            <Input
              id="due_date"
              type="date"
              aria-invalid={!!errors.due_date}
              {...register('due_date')}
            />
            {errors.due_date && (
              <p className="text-destructive text-xs">{errors.due_date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Descripción <span className="text-muted-foreground font-normal">(opcional)</span>
            </Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="Detalles del servicio o de la cobranza"
              aria-invalid={!!errors.description}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-destructive text-xs">{errors.description.message}</p>
            )}
          </div>

          {error && (
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" size="sm">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" size="sm" variant="white" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando…' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
