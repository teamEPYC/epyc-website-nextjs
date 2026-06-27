'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, useReducedMotion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Field, Input, Textarea, Select } from '@/components/ui/form'
import {
  contactSchema,
  SOURCE_OPTIONS,
  type ContactFormInput,
  type ContactInput,
} from '@/lib/contact/schema'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

// Card shell shared by form view and success view — same border/bg/radius so
// the swap reads as intentional. Padding matches the Framer source (80×40 desktop).
const CARD_BASE = 'rounded-[16px] border-[0.5px] border-ink bg-bone/10 px-4 py-12 lg:px-10 sm:py-20'

const AVATAR_FRONT = '/images/site/9kfynLGYhcGa9MrgHJQYqrLd4Ww.webp'
const AVATAR_BACK = '/images/site/pJhRncaatIpf1PdD5SxKHlhOcQ.png'

export function ContactForm() {
  const reduceMotion = useReducedMotion()
  const [state, setState] = useState<FormState>('idle')
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormInput, unknown, ContactInput>({
    resolver: zodResolver(contactSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      email: '',
      details: '',
      source: '' as unknown as ContactFormInput['source'],
      website: '',
    },
  })

  async function onSubmit(values: ContactInput) {
    setState('submitting')
    setServerError(null)
    try {
      const res = await fetch('/api/contact', {
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
        form_id: 'contact',
        form_name: 'Contact Form',
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
    <div className="grid w-full lg:max-w-[492px]">
      <motion.div
        className="col-start-1 row-start-1"
        animate={isSuccess ? { opacity: 0, y: -8 } : { opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.22, ease: 'easeOut' }}
        style={{ pointerEvents: isSuccess ? 'none' : 'auto' }}
        aria-hidden={isSuccess}
      >
        <div className="relative">
          {/* Founder avatars — 90×90 circles overlapping the top edge of the
              card (Framer source: top:-45px). The front avatar (z-10) sits on
              top of the back avatar (z-0). */}
          <div className="absolute -top-[45px] left-10 z-10 sm:left-10">
            <Image
              src={AVATAR_FRONT}
              alt="Mayank"
              width={90}
              height={90}
              className="h-[90px] w-[90px] rounded-full border-[0.5px] border-ink object-cover"
            />
          </div>
          <div className="absolute -top-[45px] left-[115px] z-0 sm:left-[115px]">
            <Image
              src={AVATAR_BACK}
              alt="Keshav"
              width={90}
              height={90}
              className="h-[90px] w-[90px] rounded-full border-[0.5px] border-ink object-cover"
            />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className={`${CARD_BASE} flex flex-col gap-4`}>
            <p className="text-body mt-8 tablet:mt-0 text-ink">
              Talk to Mayank &amp; Keshav about your organisation needs and how EPYC can help.
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

            <Field label="Email">
              <Input
                className=""
                type="email"
                placeholder="YOUR EMAIL HERE*"
                autoComplete="email"
                required
                invalid={Boolean(errors.email)}
                {...register('email')}
              />
            </Field>

            <Field label="Budget">
              <Input
                type="number"
                inputMode="numeric"
                required
                min={1}
                placeholder="$ WHAT'S YOUR BUDGET RANGE?*"
                invalid={Boolean(errors.budget)}
                {...register('budget')}
              />
            </Field>

            <Field label="Project details">
              <Textarea
                placeholder="TELL US ABOUT YOUR PROJECT*"
                required
                minLength={10}
                maxLength={4000}
                invalid={Boolean(errors.details)}
                {...register('details')}
              />
            </Field>

            <Field className="pb-8 tablet:pb-0" label="Where did you hear about us">
              <Select
                defaultValue=""
                required
                className=""
                invalid={Boolean(errors.source)}
                {...register('source')}
              >
                <option value="" disabled>
                  WHERE DID YOU HEAR ABOUT US?
                </option>
                {SOURCE_OPTIONS.map((o) => (
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
              className="sr-only "
              {...register('website')}
            />

            {serverError ? (
              <p className="text-body-sm text-crimson" role="alert">
                {serverError}
              </p>
            ) : null}

            {/* Submit button absolutely positioned, overlapping the bottom
                border of the card. Framer source: 338×80, half-out below the
                card. */}
            <Button
              type="submit"
              variant="filled"
              size="lg"
              // icon="arrow-right"
              disabled={state === 'submitting'}
              className="absolute -bottom-10 disabled:opacity-100  cursor-pointer left-1/2 h-[80px] text-cream text-base tablet:text-[20px] tracking-[-0.02em] w-[280px] max-w-[80%] -translate-x-1/2 sm:w-[338px] sm:max-w-none"
            >
              {state === 'submitting' ? 'SENDING…' : 'SUBMIT ENQUIRY'}
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
          className={`${CARD_BASE} flex flex-col items-center gap-6 text-center`}
        >
          <SuccessCheck animate={isSuccess && !reduceMotion} />
          <div className="flex flex-col gap-3">
            <h3 className="text-h3 text-ink">Thanks — we&apos;ll be in touch.</h3>
            <p className="text-body text-ink/70">
              We&apos;ve logged your enquiry. Our team will reply within one business day.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function SuccessCheck({ animate }: { animate: boolean }) {
  return (
    <motion.div
      initial={animate ? { scale: 0.8, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      transition={
        animate ? { type: 'spring', stiffness: 220, damping: 18, delay: 0.15 } : { duration: 0 }
      }
      className="flex items-center justify-center rounded-2xl bg-crimson"
      style={{ width: 88, height: 88 }}
    >
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <motion.path
          d="M 5 12 L 10 17 L 19 7"
          stroke="var(--color-cream)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={animate ? { pathLength: 0 } : false}
          animate={{ pathLength: 1 }}
          transition={animate ? { duration: 0.5, ease: 'easeOut', delay: 0.25 } : { duration: 0 }}
        />
      </svg>
    </motion.div>
  )
}
