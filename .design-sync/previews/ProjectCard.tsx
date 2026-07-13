import { ProjectCard, Section } from 'epyc-website'

const CDN = 'https://website-media.epyc.in'

export default function Preview() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 900 }}>
        <ProjectCard
          href="https://polygon.technology/"
          title="Polygon"
          tags="WEBFLOW, INTERACTIONS"
          image={{
            src: `${CDN}/images/projects/7Ql5MP7u1jXJ69ZQUw5e7o1tMU.png`,
            alt: 'Polygon project preview',
            width: 1868,
            height: 1050,
          }}
          aspect="wide"
        />
        <ProjectCard
          href="https://plum-ri.webflow.io/"
          title="Plum HQ"
          tags="WEBFLOW, UI-UX, INTERACTIONS"
          image={{
            src: `${CDN}/images/projects/lB7xt9A0ReUM3hjaHFTp8kCY9eA.webp`,
            alt: 'Plum HQ project preview',
            width: 1788,
            height: 992,
          }}
          aspect="tall"
        />
      </div>
    </Section>
  )
}
