import { Button, Section } from 'epyc-website'

export function Variants() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <Button variant="filled" href="#">
          Book a call
        </Button>
        <Button variant="outline" href="#">
          See our work
        </Button>
      </div>
    </Section>
  )
}

export function Sizes() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <Button variant="filled" size="md" href="#">
          Medium
        </Button>
        <Button variant="filled" size="lg" href="#">
          Large
        </Button>
      </div>
    </Section>
  )
}

export function WithIcon() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <Button variant="filled" icon="arrow-right" href="#">
          Start a project
        </Button>
        <Button variant="outline" icon="arrow-down" href="#">
          See the process
        </Button>
      </div>
    </Section>
  )
}

export function OnDark() {
  return (
    <Section tone="ink" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <Button variant="filled" href="#">
          Book a call
        </Button>
        {/* outline flips to cream via the data-on-dark attribute */}
        <Button variant="outline" data-on-dark="true" href="#">
          View case studies
        </Button>
      </div>
    </Section>
  )
}

export function Disabled() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <Button variant="filled" disabled>
          Sending…
        </Button>
        <Button variant="outline" disabled>
          Unavailable
        </Button>
      </div>
    </Section>
  )
}
