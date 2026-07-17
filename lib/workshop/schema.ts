import { z } from 'zod'

/**
 * The three formats <AiWorkshopFormats> offers. Keep `value` in step with the
 * CHECK constraint in db/migrations/0003_training_submissions_format.sql — the
 * database rejects anything outside this list.
 */
export const FORMAT_OPTIONS = [
  { value: 'EXEC_BRIEFING', label: 'Exec Briefing' },
  { value: 'TEAM_WORKSHOP', label: 'Team Workshop' },
  { value: 'MULTI_WEEK_PROGRAM', label: 'Multi-Week Program' },
] as const

/**
 * AI-training workshop requests. The shape mirrors `lib/contact/schema.ts`,
 * including the honeypot, so both forms validate and post the same way.
 */
export const workshopSchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name').max(120),
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  company: z.string().trim().min(1, 'Please enter your company').max(160),
  role: z.string().trim().min(1, 'Please enter your role').max(120),
  format: z.enum(['EXEC_BRIEFING', 'TEAM_WORKSHOP', 'MULTI_WEEK_PROGRAM'], {
    message: 'Pick a workshop format',
  }),
  // Honeypot — humans never see this field; bots tend to fill it.
  website: z.string().max(0).optional().or(z.literal('')),
})

export type WorkshopInput = z.output<typeof workshopSchema>
