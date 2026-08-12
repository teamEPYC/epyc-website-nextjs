import { BlogProse, Section, Container } from 'epyc-website'

// BlogProse adds no visual style of its own — it applies the `.blog-prose`
// class, which styles whatever raw HTML the CMS returns (headings, lists,
// links, blockquotes). Children must therefore be real prose markup.
export function Article() {
  return (
    <Section tone="beige" style={{ padding: '32px 0' }}>
      <Container width="prose">
        <BlogProse>
          <h2>Design systems that scale</h2>
          <p>
            A component library only pays for itself when the team reaches for
            it by default. That means the primitives have to cover the boring
            cases — a section, a container, a heading — not just the showpieces.
          </p>
          <h3>Start with rhythm</h3>
          <p>
            Vertical rhythm and horizontal measure are the two decisions every
            page repeats. Encode them once and most layout debates disappear.
          </p>
          <ul>
            <li>One section primitive owning vertical padding</li>
            <li>One container primitive owning measure and gutters</li>
            <li>A type scale that carries family, size, and leading together</li>
          </ul>
          <blockquote>
            The best design system is the one nobody has to argue with.
          </blockquote>
        </BlogProse>
      </Container>
    </Section>
  )
}
