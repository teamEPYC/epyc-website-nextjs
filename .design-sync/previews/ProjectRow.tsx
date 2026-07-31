import { ProjectRow, Section } from 'epyc-website'

const CDN = 'https://website-media.epyc.in'

export default function Preview() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <div style={{ maxWidth: 900 }}>
        <ProjectRow
          href="https://polygon.technology/"
          title="Polygon"
          tags="Webflow, Interactions, UI Design"
          image={{
            src: `${CDN}/images/projects/7Ql5MP7u1jXJ69ZQUw5e7o1tMU.png`,
            alt: 'Polygon project preview',
          }}
          defaultOpen
        />
        <ProjectRow
          href="https://plum-ri.webflow.io/"
          title="Plum HQ"
          tags="Webflow, UI/UX, Interactions"
          image={{
            src: `${CDN}/images/projects/lB7xt9A0ReUM3hjaHFTp8kCY9eA.webp`,
            alt: 'Plum HQ project preview',
          }}
        />
      </div>
    </Section>
  )
}
