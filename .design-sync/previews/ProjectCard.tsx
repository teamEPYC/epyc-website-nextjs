import { ProjectCard, Section } from 'epyc-website'

const CDN = 'https://epyc.in'

export function Wide() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <div style={{ maxWidth: 560 }}>
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
          eager
        />
      </div>
    </Section>
  )
}

export function Tall() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <div style={{ maxWidth: 420 }}>
        <ProjectCard
          href="https://plum-ri.webflow.io/"
          title="Plum HQ"
          tags="WEBFLOW, UI-UX"
          image={{
            src: `${CDN}/images/projects/lB7xt9A0ReUM3hjaHFTp8kCY9eA.webp`,
            alt: 'Plum HQ project preview',
            width: 1788,
            height: 992,
          }}
          aspect="tall"
          eager
        />
      </div>
    </Section>
  )
}

export function Pair() {
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
          eager
        />
        <ProjectCard
          href="/case-study/gokwik"
          title="GoKwik"
          tags="UI-UX, INTERACTIONS"
          image={{
            src: `${CDN}/images/projects/vGpo90ka2h6cKMdKF4OMwjSVM.png`,
            alt: 'GoKwik preview',
            width: 1868,
            height: 1050,
          }}
          eager
        />
      </div>
    </Section>
  )
}
