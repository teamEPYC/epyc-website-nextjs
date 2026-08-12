import { ShowInTldr, HideInTldr, Section, Container } from 'epyc-website'

const copy = { fontFamily: 'var(--font-norms-serif, serif)', color: '#183228' } as const

// ShowInTldr / HideInTldr read the case-study view from React context and fall
// back to the full-article view when there is no CaseStudyShell above them —
// which is what these cells show. (They are NOT wrapped in CaseStudyShell here
// on purpose: that component reads the ?view search param through the Next app
// router, which does not exist outside a Next app.)
//
// ShowInTldr therefore renders nothing in the default view. Pairing it with
// HideInTldr makes the mechanism legible: exactly one of the two shows at a time.
export function PairedWithHideInTldr() {
  return (
    <Section tone="beige" style={{ padding: '32px 0' }}>
      <Container width="prose">
        <ShowInTldr>
          <p style={copy}>ShowInTldr — visible only in the TL;DR view.</p>
        </ShowInTldr>
        <HideInTldr>
          <p style={copy}>
            HideInTldr — visible now, in the default full-article view. Inside a
            CaseStudyShell with ?view=tldr these two swap.
          </p>
        </HideInTldr>
      </Container>
    </Section>
  )
}
