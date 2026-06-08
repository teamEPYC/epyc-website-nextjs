/// <reference types="@cloudflare/workers-types" />

/**
 * Contact-form webhook consumer.
 *
 * The Next.js app enqueues each successful contact submission onto a Cloudflare
 * Queue (producer binding `CONTACT_QUEUE`). This worker drains that queue and
 * POSTs each submission to an external webhook.
 *
 * Delivery is at-least-once: a failed POST is retried (up to `max_retries` in
 * wrangler.jsonc), after which the message lands in the dead-letter queue.
 */

/** The submission, exactly as written to the Payload `submissions` table. */
type ContactSubmission = {
  name: string
  email: string
  budget: number
  details: string
  source: 'LINKEDIN' | 'FACEBOOK' | 'X' | 'INSTAGRAM'
}

type Env = {
  /** Secret — the external endpoint that receives the submission JSON. */
  CONTACT_WEBHOOK_URL: string
}

export default {
  async queue(batch: MessageBatch<ContactSubmission>, env: Env): Promise<void> {
    for (const message of batch.messages) {
      try {
        const res = await fetch(env.CONTACT_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(message.body),
        })
        if (!res.ok) {
          throw new Error(`webhook responded ${res.status}`)
        }
        message.ack()
      } catch (err) {
        // Re-queue for another attempt; exhausted retries → dead-letter queue.
        console.error('contact webhook delivery failed, will retry', err)
        message.retry()
      }
    }
  },
} satisfies ExportedHandler<Env, ContactSubmission>
