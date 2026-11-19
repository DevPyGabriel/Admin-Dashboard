import { z } from 'zod'

/** One form row creates a client and its service (subscription). */
export const clientSchema = z.object({
  full_name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.union([z.email('Introduce un email válido'), z.literal('')]),
  service_type: z.string().trim().min(2, 'Indica el tipo de servicio'),
  amount: z.number({ error: 'Introduce un monto válido' }).min(0, 'El monto no puede ser negativo'),
  due_date: z.string().trim(),
  description: z.string().trim(),
})

export type ClientFormValues = z.infer<typeof clientSchema>
