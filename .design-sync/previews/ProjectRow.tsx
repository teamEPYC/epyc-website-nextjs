import { ProjectRow, Section } from 'epyc-website'

const CDN = 'https://epyc.in'

const polygon = {
  href: 'https://polygon.technology/',
  title: 'Polygon',
  tags: 'Webflow, Interactions, UI Design',
  image: {
    src: `${CDN}/images/projects/7Ql5MP7u1jXJ69ZQUw5e7o1tMU.png`,
    alt: 'Polygon project preview',
  },
}

export function List() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <div style={{ maxWidth: 900 }}>
        <ProjectRow {...polygon} defaultOpen />
        <ProjectRow
          href="https://plum-ri.webflow.io/"
          title="Plum HQ"
          tags="Webflow, UI/UX, Interactions"
          image={{
            src: `${CDN}/images/projects/lB7xt9A0ReUM3hjaHFTp8kCY9eA.webp`,
            alt: 'Plum HQ project preview',
          }}
        />
        <ProjectRow
          href="/case-study/gokwik"
          title="GoKwik"
          tags="UI/UX, Interactions"
          image={{
            src: `${CDN}/images/projects/vGpo90ka2h6cKMdKF4OMwjSVM.png`,
            alt: 'GoKwik preview',
          }}
        />
      </div>
    </Section>
  )
}

export function Open() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <div style={{ maxWidth: 900 }}>
        <ProjectRow {...polygon} defaultOpen />
      </div>
    </Section>
  )
}

export function Collapsed() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <div style={{ maxWidth: 900 }}>
        <ProjectRow {...polygon} />
      </div>
    </Section>
  )
}
