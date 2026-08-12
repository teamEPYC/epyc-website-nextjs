import { Select, Section } from 'epyc-website'

export function BudgetRange() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <div style={{ maxWidth: 420 }}>
        <Select defaultValue="">
          <option value="" disabled>
            $ WHAT&apos;S YOUR BUDGET RANGE?*
          </option>
          <option>$5k – $15k</option>
          <option>$15k – $50k</option>
          <option>$50k+</option>
        </Select>
      </div>
    </Section>
  )
}

export function Chosen() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <div style={{ maxWidth: 420 }}>
        <Select defaultValue="$15k – $50k">
          <option>$5k – $15k</option>
          <option>$15k – $50k</option>
          <option>$50k+</option>
        </Select>
      </div>
    </Section>
  )
}

export function Invalid() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <div style={{ maxWidth: 420 }}>
        <Select invalid defaultValue="">
          <option value="" disabled>
            PLEASE CHOOSE AN OPTION*
          </option>
          <option>$5k – $15k</option>
        </Select>
      </div>
    </Section>
  )
}
