import { z } from 'zod'

/** Editable company configuration shown on the settings page. */
export const companySettingsSchema = z.object({
  company_name: z.string().trim().min(2, 'El nombre de la empresa es obligatorio'),
  support_email: z.email('Introduce un email válido'),
  sender_email: z.union([z.email('Introduce un email válido'), z.literal('')]),
  currency: z.string().trim().min(1, 'La moneda es obligatoria'),
  timezone: z.string().trim().min(1, 'La zona horaria es obligatoria'),
  reminder_days_before: z.number().int().min(1).max(30),
})

export type CompanySettingsValues = z.infer<typeof companySettingsSchema>
