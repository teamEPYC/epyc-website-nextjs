'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Field, Input, Textarea, Select } from '@/components/ui/form'
import {
  contactSchema,
  SOURCE_OPTIONS,
  type ContactFormInput,
  type ContactInput,
} from '@/lib/contact/schema'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

// Dark-tone override for the shared field primitives — className merges via
// cn()/tailwind-merge, so these win over the light `bg-bone`/`text-ink`
// defaults without touching the shared component (used as-is on /contact).
const darkField =
  'bg-black/25 border-cream/20 text-cream invalid:text-cream placeholder:text-cream/50 focus:ring-cream/50'

/** Compact dark-styled contact form for the "Start your Project" footer panel. */
export function PageCTAFooterForm() {
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
        setState('error')
        setServerError("We couldn't accept that. Please review the fields and try again.")
        return
      }
      setState('success')
    } catch {
      setState('error')
      setServerError('Network error. Check your connection and try again.')
    }
  }

  if (state === 'success') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex h-full flex-col items-center justify-center gap-3 rounded-md border border-cream/20 bg-[#242524] p-10 text-center"
      >
        <h3 className="text-h3 text-cream">Thanks — we&apos;ll be in touch.</h3>
        <p className="text-body text-cream/70">
          We&apos;ve logged your enquiry. Our team will reply within one business day.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 rounded-md border border-cream/20 bg-[#242524] p-6 lg:p-8"
    >
      <p className="text-body text-cream/80">Tell us what you&apos;re building.</p>

      <Field label="Name">
        <Input
          type="text"
          placeholder="YOUR NAME*"
          autoComplete="name"
          required
          maxLength={120}
          invalid={Boolean(errors.name)}
          className={darkField}
          {...register('name')}
        />
      </Field>

      <Field label="Email">
        <Input
          type="email"
          placeholder="YOUR EMAIL*"
          autoComplete="email"
          required
          invalid={Boolean(errors.email)}
          className={darkField}
          {...register('email')}
        />
      </Field>

      <Field label="Budget">
        <Input
          type="number"
          inputMode="numeric"
          required
          min={1}
          placeholder="$ BUDGET RANGE*"
          invalid={Boolean(errors.budget)}
          className={darkField}
          {...register('budget')}
        />
      </Field>

      <Field label="Project details">
        <Textarea
          placeholder="TELL US ABOUT YOUR PROJECT*"
          required
          minLength={10}
          maxLength={4000}
          rows={3}
          invalid={Boolean(errors.details)}
          className={darkField}
          {...register('details')}
        />
      </Field>

      <Field label="Where did you hear about us">
        <Select
          defaultValue=""
          required
          invalid={Boolean(errors.source)}
          className={darkField}
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
        icon="arrow-right"
        disabled={state === 'submitting'}
        className="w-full"
      >
        {state === 'submitting' ? 'Sending…' : 'Submit enquiry'}
      </Button>
    </form>
  )
}
