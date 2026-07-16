'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, useReducedMotion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Field, Input } from '@/components/ui/form'
import { workshopSchema, type WorkshopInput } from '@/lib/workshop/schema'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

// Card shell shared by form view and success view — same border/bg/radius so
// the swap reads as intentional. Structure mirrors <ContactForm>'s CARD_BASE;
// the colours are this page's Figma card (3787:47716): beige on the section's
// dark ground, grey border. `rounded-sm` is the 16px token.
const CARD_BASE =
  'rounded-sm border border-ink bg-beige px-4 py-12 lg:px-10 sm:py-20'

/**
 * Workshop request form — the same structure as `<ContactForm>` (react-hook-form
 * + zod, idle/submitting/success/error, honeypot, grid-stacked success view,
 * bone inputs with uppercase placeholders, submit overlapping the card's bottom
 * edge) with the four fields the Figma form draws, posting to /api/workshop.
 *
 * Single-step, so the Figma frame's "Step 1 of 2" marker isn't rendered.
 */
export function AiWorkshopForm() {
  const reduceMotion = useReducedMotion()
  const [state, setState] = useState<FormState>('idle')
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkshopInput>({
    resolver: zodResolver(workshopSchema),
    mode: 'onBlur',
    defaultValues: { name: '', email: '', company: '', role: '', website: '' },
  })

  async function onSubmit(values: WorkshopInput) {
    setState('submitting')
    setServerError(null)
    try {
      const res = await fetch('/api/workshop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { errors?: unknown }
        setState('error')
        setServerError(
          body?.errors
            ? "We couldn't accept that. Please review the fields and try again."
            : 'Something went wrong on our end. Please try again in a moment.',
        )
        return
      }
      setState('success')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).gtag?.('event', 'form_submit', {
        form_id: 'workshop',
        form_name: 'Workshop Request',
      })
    } catch {
      setState('error')
      setServerError('Network error. Check your connection and try again.')
    }
  }

  const isSuccess = state === 'success'

  return (
    // Grid stack — form and success state share one cell so the wrapper
    // auto-sizes to the taller of the two. No layout shift between states.
    <div className="mx-auto grid w-full max-w-[538px] lg:mx-0 lg:ml-auto lg:mt-[49px]">
      <motion.div
        className="col-start-1 row-start-1"
        animate={isSuccess ? { opacity: 0, y: -8 } : { opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.22, ease: 'easeOut' }}
        style={{ pointerEvents: isSuccess ? 'none' : 'auto' }}
        aria-hidden={isSuccess}
      >
        <div className="relative">
          <form onSubmit={handleSubmit(onSubmit)} className={`${CARD_BASE} flex flex-col gap-4`}>
            <p className="text-body text-ink">
              Tell us about your team and we&apos;ll come back with a custom agenda and a quote.
            </p>

            <Field label="Name">
              <Input
                type="text"
                placeholder="YOUR NAME HERE*"
                autoComplete="name"
                required
                maxLength={120}
                invalid={Boolean(errors.name)}
                {...register('name')}
              />
            </Field>

            <Field label="Work email">
              <Input
                type="email"
                placeholder="YOUR WORK EMAIL HERE*"
                autoComplete="email"
                required
                invalid={Boolean(errors.email)}
                {...register('email')}
              />
            </Field>

            <Field label="Company">
              <Input
                type="text"
                placeholder="YOUR COMPANY HERE*"
                autoComplete="organization"
                required
                maxLength={160}
                invalid={Boolean(errors.company)}
                {...register('company')}
              />
            </Field>

            <Field className="pb-8 tablet:pb-0" label="Role">
              <Input
                type="text"
                placeholder="YOUR ROLE HERE*"
                autoComplete="organization-title"
                required
                maxLength={120}
                invalid={Boolean(errors.role)}
                {...register('role')}
              />
            </Field>

            {/* Honeypot — visually hidden, off the tab order. */}
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="sr-only"
              {...register('website')}
            />

            {serverError ? (
              <p className="text-body-sm text-crimson" role="alert">
                {serverError}
              </p>
            ) : null}

            {/* Submit absolutely positioned, overlapping the bottom border of
                the card — same geometry as the contact form's. */}
            <Button
              type="submit"
              variant="filled"
              size="lg"
              disabled={state === 'submitting'}
              className="absolute -bottom-10 left-1/2 h-[80px] w-[280px] max-w-[80%] -translate-x-1/2 cursor-pointer text-base tracking-[-0.02em] text-cream disabled:opacity-100 sm:w-[338px] sm:max-w-none tablet:text-[20px]"
            >
              {state === 'submitting' ? 'SENDING…' : 'REQUEST A WORKSHOP'}
            </Button>
          </form>
        </div>
      </motion.div>

      <motion.div
        className="col-start-1 row-start-1"
        initial={false}
        animate={isSuccess ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 0.36, delay: isSuccess ? 0.1 : 0, ease: [0.16, 1, 0.3, 1] }
        }
        style={{ pointerEvents: isSuccess ? 'auto' : 'none' }}
        aria-hidden={!isSuccess}
      >
        <div
          role="status"
          aria-live="polite"
          className={`${CARD_BASE} flex flex-col items-center gap-3 text-center`}
        >
          <h3 className="text-h3 text-ink">Thanks — we&apos;ll be in touch.</h3>
          <p className="text-body text-ink/70">
            We&apos;ve logged your request. Our team will reply within one business day.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
