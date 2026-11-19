import { useState } from 'react'
import { addDays, format } from 'date-fns'
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
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { ClientService } from '@/features/clients/api/clients.api'
import { useCreateClientService, useUpdateClientService } from '@/features/clients/hooks/useClients'
import {
  clientSchema,
  serviceTypeLabels,
  serviceTypes,
  type ClientFormValues,
} from '@/features/clients/schemas/client.schema'

interface ClientFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  service: ClientService | null
}

export function ClientFormDialog({ open, onOpenChange, service }: ClientFormDialogProps) {
  const [error, setError] = useState<string | null>(null)
  const createService = useCreateClientService()
  const updateService = useUpdateClientService()
  const currency = service?.currency || 'USD'
  const currencyPrefix = currency === 'USD' ? '$' : currency
  const defaultDueDate = service
    ? (service.dueDate ?? '')
    : format(addDays(new Date(), 30), 'yyyy-MM-dd')

  // Legacy rows may hold a free-text plan; force an explicit choice when editing.
  const initialServiceType = serviceTypes.find((type) => type === service?.serviceType)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      full_name: service?.clientName ?? '',
      email: service?.email ?? '',
      service_type: initialServiceType,
      amount: service?.amount ?? 0,
      due_date: defaultDueDate,
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="pr-10">
          <DialogTitle>{service ? 'Editar cliente' : 'Nuevo cliente'}</DialogTitle>
          <DialogDescription className="text-xs">
            Los cambios se guardan directamente en Supabase y se reflejan al instante.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col" noValidate>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain pr-1 overflow-visible">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nombre del cliente</Label>
              <Input
                className="text-[13px]"
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
                Correo electrónico <span className="text-secondary font-normal">(opcional)</span>
              </Label>
              <Input
                className="text-[13px]"
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
                <Select
                  className="border-input bg-input/30 text-secondary h-9 rounded-md text-[13px]"
                  id="service_type"
                  aria-invalid={!!errors.service_type}
                  {...register('service_type')}
                >
                  <option value="">Selecciona un tipo de servicio</option>
                  {serviceTypes.map((type) => (
                    <option key={type} value={type}>
                      {serviceTypeLabels[type]}
                    </option>
                  ))}
                </Select>
                {errors.service_type && (
                  <p className="text-destructive text-xs">{errors.service_type.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Monto ({currency})</Label>
                <div className="relative">
                  <span
                    aria-hidden="true"
                    className="text-muted-foreground pointer-events-none absolute inset-y-0 left-3 flex items-center text-[13px]"
                  >
                    {currencyPrefix}
                  </span>
                  <Input
                    className="pl-6 text-[13px]"
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    aria-invalid={!!errors.amount}
                    {...register('amount', { valueAsNumber: true })}
                  />
                </div>
                {errors.amount && (
                  <p className="text-destructive text-xs">{errors.amount.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">
                Fecha de vencimiento <span className="text-secondary font-normal">(opcional)</span>
              </Label>
              <Input
                className="text-secondary text-[13px]"
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
                Descripción <span className="text-secondary font-normal">(opcional)</span>
              </Label>
              <Textarea
                className="text-[13px]"
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
          </div>

          {error && (
            <p className="text-destructive shrink-0 pt-3 text-sm" role="alert">
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
