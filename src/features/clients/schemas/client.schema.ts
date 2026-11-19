import { z } from 'zod'

export const serviceTypes = ['transporte', 'taxi', 'delivery'] as const
export type ServiceType = (typeof serviceTypes)[number]

export const serviceTypeLabels: Record<ServiceType, string> = {
  transporte: 'Transporte',
  taxi: 'Taxi',
  delivery: 'Delivery',
}

/** One service row inside the client form. */
export const clientServiceSchema = z.object({
  id: z.string().optional(),
  service_type: z.enum(serviceTypes, { error: 'Selecciona un tipo de servicio' }),
  amount: z.number({ error: 'Introduce un monto válido' }).min(0, 'El monto no puede ser negativo'),
  due_date: z.string().trim(),
  description: z.string().trim(),
})

/** One client can own several services, each with its own amount and due date. */
export const clientSchema = z.object({
  full_name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.union([z.email('Introduce un email válido'), z.literal('')]),
  services: z.array(clientServiceSchema).min(1, 'Agrega al menos un servicio'),
})

export type ClientServiceValues = z.infer<typeof clientServiceSchema>
export type ClientFormValues = z.infer<typeof clientSchema>
