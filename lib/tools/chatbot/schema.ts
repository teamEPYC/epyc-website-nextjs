import { z } from 'zod'

/**
 * Request schemas for the AI chatbot tool's routes.
 *
 * Kept beside the tool rather than in the route files, matching
 * lib/contact/schema.ts and lib/workshop/schema.ts — the routes parse, the
 * schema lives here.
 */

export const crawlSchema = z.object({
  url: z.string().min(1).max(2048),
  /** Set by the "read my site again" button — bypasses the 24h reuse cache. */
  force: z.boolean().optional().default(false),
})

export const messageSchema = z.object({
  sessionId: z.string().uuid(),
  message: z.string().min(1).max(2000),
})

/** Claiming an embed. Email is captured, not yet verified — see the route. */
export const claimSchema = z.object({
  sessionId: z.string().uuid(),
  email: z.string().email().max(320),
})

/** A message sent to a live widget on a customer's own site. */
export const embedMessageSchema = z.object({
  key: z.string().max(64),
  message: z.string().min(1).max(2000),
  /** Prior turns, held by the widget rather than the server. */
  history: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().max(4000) }))
    .max(20)
    .optional()
    .default([]),
})

/** Asking for a verification code. */
export const verifySendSchema = z.object({
  sessionId: z.string().uuid(),
  email: z.string().email().max(320),
})

/** Submitting one. */
export const verifyCheckSchema = z.object({
  sessionId: z.string().uuid(),
  email: z.string().email().max(320),
  code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code.'),
})

export type CrawlInput = z.infer<typeof crawlSchema>
export type MessageInput = z.infer<typeof messageSchema>
export type ClaimInput = z.infer<typeof claimSchema>
export type EmbedMessageInput = z.infer<typeof embedMessageSchema>
