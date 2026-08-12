import { ReadingProgress, Section, Container } from 'epyc-website'

// A 4px crimson bar fixed to the top of the viewport whose width tracks scroll
// position. At scroll 0 its width is 0%, so the honest way to show it is with
// enough content that the bar has a measurable width — it is still a thin
// crimson line at the very top of the card.
export function AtTopOfArticle() {
  return (
    <div style={{ position: 'relative', minHeight: 260 }}>
      <ReadingProgress />
      <Section tone="beige" style={{ padding: '32px 0' }}>
        <Container width="prose">
          <p style={{ fontFamily: 'var(--font-norms-serif, serif)', color: '#183228' }}>
            The reading-progress bar sits at the top edge of the viewport and
            fills from left to right as the article is scrolled. Drop it once at
            the root of a blog post layout.
          </p>
        </Container>
      </Section>
    </div>
  )
}
