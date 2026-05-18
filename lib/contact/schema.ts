import { z } from 'zod'

export const SOURCE_OPTIONS = [
  { value: 'LINKEDIN', label: 'LinkedIn' },
  { value: 'FACEBOOK', label: 'Facebook' },
  { value: 'X', label: 'X (Twitter)' },
  { value: 'INSTAGRAM', label: 'Instagram' },
] as const

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name').max(120),
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  budget: z.coerce
    .number({ message: 'Enter your budget (numbers only)' })
    .int('Whole numbers only')
    .positive('Budget must be greater than zero'),
  details: z
    .string()
    .trim()
    .min(10, 'Tell us a little more — at least 10 characters')
    .max(4000, 'Keep it under 4000 characters'),
  source: z.enum(['LINKEDIN', 'FACEBOOK', 'X', 'INSTAGRAM'], {
    message: 'Pick where you heard about us',
  }),
  // Honeypot — humans never see this field; bots tend to fill it.
  website: z.string().max(0).optional().or(z.literal('')),
})

/** Pre-parse shape — what the form holds before Zod coercion (budget is a string from a number input). */
export type ContactFormInput = z.input<typeof contactSchema>
/** Post-parse shape — what the API route + Payload receive. */
export type ContactInput = z.output<typeof contactSchema>
