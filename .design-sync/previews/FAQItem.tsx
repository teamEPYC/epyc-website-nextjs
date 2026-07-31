import { FAQItem, Section } from 'epyc-website'

export default function Preview() {
  return (
    <Section tone="ink" style={{ padding: '32px' }}>
      <div style={{ maxWidth: 640 }}>
        <FAQItem question="Do you offer design services?" defaultOpen>
          Yes — UI, UX, brand systems, and motion. We can work end-to-end from research and information architecture through visual design, prototyping, and developer handoff.
        </FAQItem>
        <FAQItem question="What kind of projects can you build?">
          Marketing sites, complex SaaS UI, internal tools, mobile-responsive web apps, and bespoke landing pages. We pick the right stack based on what the project actually needs.
        </FAQItem>
        <FAQItem question="How much do you charge?">
          Project pricing depends on scope, complexity, and timeline. Most marketing-site builds start in the low five figures; retainers are available for ongoing design + engineering support.
        </FAQItem>
      </div>
    </Section>
  )
}
