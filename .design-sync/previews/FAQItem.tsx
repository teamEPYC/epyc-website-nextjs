import { FAQItem, Section } from 'epyc-website'

// FAQItem is cream-on-ink by design (border-cream/40, text-cream) — it only
// reads correctly inside a dark Section.
export function List() {
  return (
    <Section tone="ink" style={{ padding: '32px' }}>
      <div style={{ maxWidth: 640 }}>
        <FAQItem question="Do you offer design services?" defaultOpen>
          Yes — UI, UX, brand systems, and motion. We can work end-to-end from
          research and information architecture through visual design,
          prototyping, and developer handoff.
        </FAQItem>
        <FAQItem question="What kind of projects can you build?">
          Marketing sites, complex SaaS UI, internal tools, mobile-responsive
          web apps, and bespoke landing pages.
        </FAQItem>
        <FAQItem question="How much do you charge?">
          Project pricing depends on scope, complexity, and timeline. Retainers
          are available for ongoing design + engineering support.
        </FAQItem>
      </div>
    </Section>
  )
}

export function Closed() {
  return (
    <Section tone="ink" style={{ padding: '32px' }}>
      <div style={{ maxWidth: 640 }}>
        <FAQItem question="Do you offer design services?">
          Collapsed state — the PlusMinus icon shows the plus glyph and the
          answer is unmounted.
        </FAQItem>
      </div>
    </Section>
  )
}

export function Open() {
  return (
    <Section tone="ink" style={{ padding: '32px' }}>
      <div style={{ maxWidth: 640 }}>
        <FAQItem question="Do you offer design services?" defaultOpen>
          Expanded state — the icon swaps to minus and the answer animates to
          its full height.
        </FAQItem>
      </div>
    </Section>
  )
}
