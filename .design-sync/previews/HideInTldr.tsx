import { HideInTldr, Section, Container } from 'epyc-website'

// Wraps the long-form detail the TL;DR view drops. With no CaseStudyShell above
// it, the context default is the full-article view, so its children render —
// which is the state worth showing.
export function FullArticleDetail() {
  return (
    <Section tone="beige" style={{ padding: '32px 0' }}>
      <Container width="prose">
        <HideInTldr>
          <p style={{ fontFamily: 'var(--font-norms-serif, serif)', color: '#183228' }}>
            The deep-dive section: research notes, process, and the decisions
            behind the redesign. Readers who pick TL;DR never see this.
          </p>
        </HideInTldr>
      </Container>
    </Section>
  )
}
