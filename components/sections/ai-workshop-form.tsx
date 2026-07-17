'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, useReducedMotion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Field, Input, Select } from '@/components/ui/form'
import { FORMAT_OPTIONS, workshopSchema, type WorkshopInput } from '@/lib/workshop/schema'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

// Card shell shared by form view and success view — same border/bg/radius so
// the swap reads as intentional. Structure mirrors <ContactForm>'s CARD_BASE;
// the colours are this page's Figma card (3787:47716): beige on the section's
// dark ground, grey border. `rounded-sm` is the 16px token.
// Radius, border and field rhythm follow <ContactForm> (contact-form.tsx:21);
// `rounded-sm` is the token form of its `rounded-[16px]`, identical value.
//
// Two deliberate divergences:
//  - Fill: contact's `bg-bone/10` is 10% opaque, fine on its light page but it
//    would all but vanish over this section's ink + texture. Beige stays legible.
//  - Vertical padding: 20/32 top, 32/56 bottom, against contact's flat 48/80.
//    That card owns its page; this one shares a two-column section, where the
//    outer padding was mostly dead space. Top is lighter than bottom because
//    only the bottom has to clear the submit.
//
// Horizontal padding is what sets input width — the fields are `w-full`, so they
// measure card-minus-px. The `sm` step is load-bearing, not decoration: without
// it `px-4` held from 0 to 1200 and the inputs came out *widest* in the middle
// (460px between ~540 and 1200, against 412 on desktop), because the card hits
// its 492 cap long before `lg` relaxes the gutter. 16/24/40 keeps them narrowing
// monotonically: 358 -> 444 -> 412. `lg:px-10` is contact's value, so the inputs
// land at contact's 412px too.
//
// The submit sits `-bottom-10` (40px) over the bottom border, so bottom padding
// is a floor — it must clear 40px or the button lands on the last field. See the
// last field's `pb-8`, which covers the gap while `pb` is at its smallest.
const CARD_BASE =
  'rounded-sm border-[0.5px] border-ink bg-beige px-4 pt-5 pb-8 sm:px-6 sm:pt-8 sm:pb-14 lg:px-10'

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
    defaultValues: {
      name: '',
      email: '',
      company: '',
      role: '',
      // Empty so the disabled placeholder <option> shows first; Zod rejects it
      // if untouched. Cast because '' isn't in the enum — same as <ContactForm>.
      format: '' as unknown as WorkshopInput['format'],
      website: '',
    },
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
    // 492px matches <ContactForm>'s card (contact-form.tsx:83) so the shared
    // 338px submit sits the same way in both. Figma draws this one at 538, but
    // the two forms reading as one component beats matching the frame.
    //
    // Capped below lg too, unlike contact's `w-full`: that section splits at
    // `tablet` (800) so its form is only ever full-width on a phone, while this
    // one splits at `lg` — uncapped, it would stretch to the 1256px container.
    <div className="mx-auto grid w-full max-w-[492px] lg:mx-0 lg:ml-auto lg:mt-[49px]">
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

            <Field label="Role">
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

            {/* Last field, so it carries the submit's bottom clearance. Keyed to
                `sm` (810) — the breakpoint that raises `py` to 56 — not contact's
                `tablet` (800), which would drop it 10px early and leave only 32px
                under the field. */}
            <Field className="pb-8 sm:pb-0" label="Workshop format">
              <Select
                defaultValue=""
                required
                invalid={Boolean(errors.format)}
                {...register('format')}
              >
                <option value="" disabled>
                  WHICH FORMAT?*
                </option>
                {FORMAT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label.toUpperCase()}
                  </option>
                ))}
              </Select>
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

            {/* Geometry is contact-form.tsx's submit verbatim — 80×280/338, and
                `-bottom-10` is half of `h-[80px]` so it straddles the card's
                bottom border. Keep the offset at half the height if either
                changes, and keep the card's bottom padding above the inner half
                (40px) or this lands on the last field.
                `size="lg"` is inert: these overrides beat everything it sets. */}
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
