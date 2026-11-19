import { z } from 'zod'

const emailListSchema = z.string().refine((value) => {
  const emails = value
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean)
  return emails.every((email) => z.email().safeParse(email).success)
}, 'Introduce correos válidos separados por coma')

/** Editable company configuration shown on the settings page. */
export const companySettingsSchema = z.object({
  company_name: z.string().trim().min(2, 'El nombre de la empresa es obligatorio'),
  support_email: z.email('Introduce un email válido'),
  sender_email: z.union([z.email('Introduce un email válido'), z.literal('')]),
  operator_emails: emailListSchema,
  currency: z.string().trim().min(1, 'La moneda es obligatoria'),
  timezone: z.string().trim().min(1, 'La zona horaria es obligatoria'),
  reminder_days_before: z.number().int().min(1).max(30),
})

export type CompanySettingsValues = z.infer<typeof companySettingsSchema>

export function parseOperatorEmails(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(',')
        .map((email) => email.trim())
        .filter(Boolean),
    ),
  )
}
