import { PaperBackground, Container, SectionHeading } from 'epyc-website'

// Warm paper texture wrapper with optional ink fade-outs at top/bottom. The
// default textureUrl is a site-relative /images/site/… asset, so these cells
// pass the production URL explicitly to make the texture visible off-site.
const TEXTURE = 'https://epyc.in/images/site/4svPWouJqvqnznpkeku35FoPOY.webp'

export function Textured() {
  return (
    <PaperBackground textureUrl={TEXTURE} style={{ padding: '48px 0' }}>
      <Container>
        <SectionHeading tone="ink" size="h3" eyebrow="Studio">
          Warm paper texture
        </SectionHeading>
      </Container>
    </PaperBackground>
  )
}

export function GradientBoth() {
  return (
    <PaperBackground gradient="both" textureUrl={TEXTURE} style={{ padding: '64px 0' }}>
      <Container>
        <SectionHeading tone="ink" size="h3">
          gradient=&quot;both&quot; fades into the ink sections above and below
        </SectionHeading>
      </Container>
    </PaperBackground>
  )
}

export function GradientTop() {
  return (
    <PaperBackground gradient="top" textureUrl={TEXTURE} style={{ padding: '64px 0' }}>
      <Container>
        <SectionHeading tone="ink" size="h3">
          gradient=&quot;top&quot;
        </SectionHeading>
      </Container>
    </PaperBackground>
  )
}
