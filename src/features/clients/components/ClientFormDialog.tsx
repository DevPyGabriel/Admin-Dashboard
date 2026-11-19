import { useEffect } from 'react'
import { addDays, format } from 'date-fns'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { useFieldArray, useForm } from 'react-hook-form'
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
import { useSaveClient } from '@/features/clients/hooks/useClients'
import {
  clientSchema,
  serviceTypeLabels,
  serviceTypes,
  type ClientFormValues,
  type ClientServiceValues,
} from '@/features/clients/schemas/client.schema'

interface ClientFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  service: ClientService | null
  additionalServices?: ClientService[]
  startWithNewService?: boolean
}

function emptyService(): ClientServiceValues {
  return {
    service_type: 'transporte',
    amount: 0,
    due_date: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    description: '',
  }
}

function toFormValues(
  service: ClientService | null,
  additionalServices: ClientService[],
  startWithNewService: boolean,
): ClientFormValues {
  const services = [service, ...additionalServices].filter((item): item is ClientService =>
    Boolean(item),
  )
  const mapped = services.map((item) => ({
    id: item.id,
    service_type: item.serviceType as ClientServiceValues['service_type'],
    amount: item.amount,
    due_date: item.dueDate ?? '',
    description: item.description ?? '',
  }))

  return {
    full_name: service?.clientName ?? '',
    email: service?.email ?? '',
    services: mapped.length
      ? [...mapped, ...(startWithNewService ? [emptyService()] : [])]
      : [emptyService()],
  }
}

export function ClientFormDialog({
  open,
  onOpenChange,
  service,
  additionalServices = [],
  startWithNewService = false,
}: ClientFormDialogProps) {
  const saveClient = useSaveClient()
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: toFormValues(service, additionalServices, startWithNewService),
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'services' })

  useEffect(() => {
    if (open) reset(toFormValues(service, additionalServices, startWithNewService))
  }, [open, service, additionalServices, startWithNewService, reset])

  const onSubmit = handleSubmit(async (values) => {
    await saveClient.mutateAsync(values)
    onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{service ? 'Editar cliente' : 'Nuevo cliente'}</DialogTitle>
          <DialogDescription>
            Cada servicio tiene su propio monto, vencimiento y estado calculado.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="client-full-name">Nombre completo</Label>
              <Input id="client-full-name" autoComplete="name" {...register('full_name')} />
              {errors.full_name && (
                <p className="text-destructive text-xs">{errors.full_name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="client-email">Correo electrÃ³nico</Label>
              <Input id="client-email" type="email" autoComplete="email" {...register('email')} />
              {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-foreground text-sm font-semibold">Servicios</p>
                <p className="text-muted-foreground text-xs">
                  Agrega todos los servicios de este cliente.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append(emptyService())}
              >
                <Plus className="size-4" aria-hidden="true" />
                Agregar servicio
              </Button>
            </div>

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="border-border/70 bg-muted/20 rounded-xl border p-3 sm:p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-foreground text-sm font-medium">Servicio {index + 1}</p>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Quitar servicio ${index + 1}`}
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="text-destructive size-4" aria-hidden="true" />
                    </Button>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label htmlFor={`service-type-${index}`}>Tipo</Label>
                    <Select
                      id={`service-type-${index}`}
                      {...register(`services.${index}.service_type`)}
                    >
                      {serviceTypes.map((type) => (
                        <option key={type} value={type}>
                          {serviceTypeLabels[type]}
                        </option>
                      ))}
                    </Select>
                    {errors.services?.[index]?.service_type && (
                      <p className="text-destructive text-xs">
                        {errors.services[index]?.service_type?.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`service-amount-${index}`}>Monto</Label>
                    <Input
                      id={`service-amount-${index}`}
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      {...register(`services.${index}.amount`, { valueAsNumber: true })}
                    />
                    {errors.services?.[index]?.amount && (
                      <p className="text-destructive text-xs">
                        {errors.services[index]?.amount?.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`service-due-${index}`}>Vencimiento</Label>
                    <Input
                      id={`service-due-${index}`}
                      type="date"
                      {...register(`services.${index}.due_date`)}
                    />
                  </div>
                </div>

                <div className="mt-3 space-y-1.5">
                  <Label htmlFor={`service-description-${index}`}>DescripciÃ³n (opcional)</Label>
                  <Textarea
                    id={`service-description-${index}`}
                    rows={2}
                    placeholder="Detalle del servicio"
                    {...register(`services.${index}.description`)}
                  />
                </div>
              </div>
            ))}

            {errors.services?.root && (
              <p className="text-destructive text-xs">{errors.services.root.message}</p>
            )}
          </div>

          {saveClient.isError && (
            <p className="bg-destructive/10 text-destructive rounded-lg px-3 py-2 text-sm">
              No se pudo guardar: {saveClient.error.message}
            </p>
          )}

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={saveClient.isPending}>
              {saveClient.isPending ? 'Guardandoâ€¦' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
