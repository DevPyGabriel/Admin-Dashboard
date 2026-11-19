import { z } from 'zod'

export const clientSchema = z.object({
  full_name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.email('Introduce un email válido'),
  phone: z.string().trim(),
  tax_id: z.string().trim(),
  notes: z.string().trim(),
})

export type ClientFormValues = z.infer<typeof clientSchema>
