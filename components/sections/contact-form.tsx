'use client'

import { useState } from 'react'
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
    } catch {
      setState('error')
      setServerError('Network error. Check your connection and try again.')
    }
  }

  const isSuccess = state === 'success'

  return (
    // Grid stack — form and success state share one cell, so the container
    // auto-sizes to the taller of the two. No layout shift between states.
    <div className="grid w-full">
      <motion.div
        className="col-start-1 row-start-1"
        animate={isSuccess ? { opacity: 0, y: -8 } : { opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.22, ease: 'easeOut' }}
        style={{ pointerEvents: isSuccess ? 'none' : 'auto' }}
        aria-hidden={isSuccess}
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-4 rounded-2xl border border-ink/30 bg-bone/40 p-8 sm:p-10 lg:p-12"
        >
          <p className="text-body text-ink">
            Talk to Mayank &amp; Keshav about your organisation needs and how EPYC can help.
          </p>

          <Field label="Name" error={errors.name?.message}>
            <Input
              type="text"
              placeholder="YOUR NAME HERE*"
              autoComplete="name"
              invalid={Boolean(errors.name)}
              {...register('name')}
            />
          </Field>

          <Field label="Email" error={errors.email?.message}>
            <Input
              type="email"
              placeholder="YOUR EMAIL HERE*"
              autoComplete="email"
              invalid={Boolean(errors.email)}
              {...register('email')}
            />
          </Field>

          <Field label="Budget" error={errors.budget?.message}>
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="$ WHAT'S YOUR BUDGET RANGE?*"
              invalid={Boolean(errors.budget)}
              {...register('budget')}
            />
          </Field>

          <Field label="Project details" error={errors.details?.message}>
            <Textarea
              placeholder="TELL US ABOUT YOUR PROJECT*"
              invalid={Boolean(errors.details)}
              {...register('details')}
            />
          </Field>

          <Field label="Where did you hear about us" error={errors.source?.message}>
            <Select
              defaultValue=""
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

          {/* Honeypot — visually hidden, off the tab order. Bots fill it, humans don't. */}
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

          <Button
            type="submit"
            variant="filled"
            size="lg"
            icon="arrow-right"
            disabled={state === 'submitting'}
            className="self-stretch"
          >
            {state === 'submitting' ? 'SENDING…' : 'SUBMIT ENQUIRY'}
          </Button>
        </form>
      </motion.div>

      <motion.div
        className="col-start-1 row-start-1 flex items-center justify-center"
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
          className="flex flex-col items-center gap-6 rounded-2xl border border-ink/30 bg-bone/40 p-10 text-center sm:p-12"
        >
          <SuccessCheck animate={isSuccess && !reduceMotion} />
          <div className="flex flex-col gap-3">
            <h3 className="text-h3 text-ink">Thanks — we&apos;ll be in touch.</h3>
            <p className="text-body text-ink/70">
              We&apos;ve logged your enquiry. Mayank &amp; Keshav will reply within one business day.
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
        animate
          ? { type: 'spring', stiffness: 220, damping: 18, delay: 0.15 }
          : { duration: 0 }
      }
      className="flex h-22 w-22 items-center justify-center rounded-2xl bg-crimson"
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
