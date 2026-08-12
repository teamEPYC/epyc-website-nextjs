import { Field, Input, Textarea, Select, Section } from 'epyc-website'

// Field renders a screen-reader-only label and lets the placeholder carry the
// visible prompt — that is the design, so a Field looks like a bare input.
export function TextField() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <div style={{ maxWidth: 420 }}>
        <Field label="Your name">
          <Input placeholder="YOUR NAME HERE*" />
        </Field>
      </div>
    </Section>
  )
}

export function FullForm() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 420 }}>
        <Field label="Your name">
          <Input placeholder="YOUR NAME HERE*" />
        </Field>
        <Field label="Your email">
          <Input type="email" placeholder="YOUR EMAIL HERE*" />
        </Field>
        <Field label="Budget range">
          <Select defaultValue="">
            <option value="" disabled>
              $ WHAT&apos;S YOUR BUDGET RANGE?*
            </option>
            <option>$5k – $15k</option>
            <option>$15k – $50k</option>
            <option>$50k+</option>
          </Select>
        </Field>
        <Field label="About your project">
          <Textarea placeholder="TELL US ABOUT YOUR PROJECT*" />
        </Field>
      </div>
    </Section>
  )
}

export function Invalid() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <div style={{ maxWidth: 420 }}>
        <Field label="Your email" error="Enter a valid email">
          <Input invalid defaultValue="not-an-email" />
        </Field>
      </div>
    </Section>
  )
}
