import {
  forwardRef,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/cn'

const fieldClasses = [
  'w-full rounded-[16px] bg-bone text-body text-ink',
  'border border-ink/10',
  'placeholder:text-ink/60 placeholder:uppercase placeholder:tracking-wide',
  'px-5 py-4',
  'transition-[box-shadow,border-color] outline-none',
  'focus:border-ink/30 focus:ring-2 focus:ring-crimson/30',
  'disabled:opacity-60',
].join(' ')

type FieldProps = {
  label: string
  error?: string
  className?: string
  children: ReactNode
}

/**
 * Wraps a single field. Label is screen-reader only (the design uses
 * placeholders). Reserves a fixed-height row for the error message so the
 * form doesn't jump when validation kicks in.
 */
export function Field({ label, error, className, children }: FieldProps) {
  return (
    <label className={cn('flex flex-col gap-1.5', className)}>
      <span className="sr-only">{label}</span>
      {children}
      <span
        className={cn(
          'min-h-[1.25rem] text-body-sm text-crimson',
          error ? 'opacity-100' : 'opacity-0',
        )}
        aria-live="polite"
      >
        {error ?? ' '}
      </span>
    </label>
  )
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(fieldClasses, invalid && 'border-crimson/60', className)}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  )
})

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid, rows = 5, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(fieldClasses, 'resize-none', invalid && 'border-crimson/60', className)}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  )
})

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, invalid, children, ...rest },
  ref,
) {
  return (
    <select
      ref={ref}
      className={cn(
        fieldClasses,
        'appearance-none px-3 font-normal text-[#222222] bg-[#bbbbbb26] text-base font-sans py-2 rounded-[10px] min-h-none pr-10',
        invalid && 'border-crimson/60',
        className,
      )}
      aria-invalid={invalid || undefined}
      {...rest}
    >
      {children}
    </select>
  )
})
