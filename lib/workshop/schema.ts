import { z } from 'zod'

/**
 * AI-training workshop requests. Fields are the four drawn in the Figma form
 * (3787:47716); the shape mirrors `lib/contact/schema.ts`, including the
 * honeypot, so both forms validate and post the same way.
 */
export const workshopSchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name').max(120),
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  company: z.string().trim().min(1, 'Please enter your company').max(160),
  role: z.string().trim().min(1, 'Please enter your role').max(120),
  // Honeypot — humans never see this field; bots tend to fill it.
  website: z.string().max(0).optional().or(z.literal('')),
})

export type WorkshopInput = z.output<typeof workshopSchema>
