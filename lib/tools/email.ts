/**
 * Sending mail.
 *
 * No provider is configured yet, so this logs instead of sending. Everything
 * around it — code generation, hashing, expiry, attempt limits, abuse caps —
 * is real, so the day an account exists this is the only function that
 * changes.
 *
 * When adding one (Resend is the likely pick — a plain fetch, no npm package):
 *
 *   const res = await fetch('https://api.resend.com/emails', {
 *     method: 'POST',
 *     headers: {
 *       authorization: `Bearer ${env.RESEND_API_KEY}`,
 *       'content-type': 'application/json',
 *     },
 *     body: JSON.stringify({ from: FROM, to, subject, text }),
 *   })
 *   if (!res.ok) throw new Error(`send failed: ${res.status}`)
 *
 * That also needs SPF and DKIM records on epyc.in, or the mail is rejected or
 * spam-filed. The DNS half is not optional and is the part that gets forgotten.
 */

export type Email = {
  to: string
  subject: string
  text: string
}

export type SendResult = { sent: boolean; stubbed: boolean }

/**
 * Deliver an email, or log it while no provider exists.
 *
 * Never throws for a stubbed send — the caller's flow must work identically
 * either way, so that swapping in a provider changes delivery and nothing else.
 */
export async function sendEmail(
  env: { RESEND_API_KEY?: string },
  email: Email,
): Promise<SendResult> {
  if (!env.RESEND_API_KEY) {
    // Deliberately readable in `pnpm dev` output: this is how anyone tests the
    // flow before a provider exists.
    console.warn(
      [
        '',
        '─────────── EMAIL (not sent — no provider configured) ───────────',
        `To:      ${email.to}`,
        `Subject: ${email.subject}`,
        '',
        email.text,
        '─────────────────────────────────────────────────────────────────',
        '',
      ].join('\n'),
    )
    return { sent: false, stubbed: true }
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from: 'EPYC <hello@epyc.in>',
      to: email.to,
      subject: email.subject,
      text: email.text,
    }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Email send failed: ${res.status} ${detail.slice(0, 200)}`)
  }

  return { sent: true, stubbed: false }
}

/** The verification email. Plain text — it is one number. */
export function verificationEmail(to: string, code: string, host: string): Email {
  return {
    to,
    subject: `${code} is your EPYC verification code`,
    text: [
      `Your verification code is ${code}`,
      '',
      `Enter it to get the chatbot code for ${host}.`,
      'The code expires in 10 minutes.',
      '',
      'If you did not request this, ignore this email.',
      '',
      '— EPYC',
    ].join('\n'),
  }
}
