/// <reference types="@cloudflare/workers-types" />

/**
 * Form webhook consumer.
 *
 * The Next.js app enqueues each successful submission — from the contact form
 * and the AI-training workshop form alike — onto a Cloudflare Queue (producer
 * binding `CONTACT_QUEUE`). This worker drains that queue and POSTs each
 * submission to an external webhook, `table` field included, so the receiver
 * can route on which form it came from.
 *
 * Delivery is at-least-once: a failed POST is retried (up to `max_retries` in
 * wrangler.jsonc), after which the message lands in the dead-letter queue.
 */

/**
 * A submission, exactly as written to D1, plus the table it landed in.
 *
 * Two forms share this queue — the contact form and the AI-training workshop
 * request — so `table` is what the webhook receiver switches on. The remaining
 * fields differ per form and are forwarded verbatim; this worker never reads
 * them.
 */
type Submission = {
  table: 'contact_submissions' | 'epyc_ai_training_submissions'
  [field: string]: unknown
}

type Env = {
  /** Secret — the external endpoint that receives the submission JSON. */
  CONTACT_WEBHOOK_URL: string
}

export default {
  async queue(batch: MessageBatch<Submission>, env: Env): Promise<void> {
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
} satisfies ExportedHandler<Env, Submission>
