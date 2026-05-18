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
  'outline-none transition-shadow',
  'focus:ring-1 focus:ring-[#0099ff]',
  'disabled:opacity-60',
].join(' ')

type FieldProps = {
  label: string
  /** Kept in the API for caller compatibility but no longer rendered — the
   *  red outline on the input itself is the only error signal. */
  error?: string
  className?: string
  children: ReactNode
}

/**
 * Wraps a single field. Label is screen-reader only (the design uses
 * placeholders). Validation feedback is the red outline on the input —
 * no inline message.
 */
export function Field({ label, className, children }: FieldProps) {
  return (
    <label className={cn('flex flex-col', className)}>
      <span className="sr-only">{label}</span>
      {children}
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
      className={cn(
        fieldClasses,
        className,
        'px-3 py-3 h-16 tracking-tighter leading-[1.2em] font-normal  text-base rounded-sm',
      )}
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
      className={cn(
        fieldClasses,
        'resize-y min-h-[120px] px-3 py-3 h-16 tracking-tigh text-base leading-[1.2em] rounded-sm',
        className,
      )}
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
        'appearance-none px-3 py-3 text-body flex items-center justify-center h-16 tracking-tighter leading-[1.2em] font-normal  text-base rounded-sm',
        'invalid:text-ink/60',
        className,
      )}
      aria-invalid={invalid || undefined}
      {...rest}
    >
      {children}
    </select>
  )
})
