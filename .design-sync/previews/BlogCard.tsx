import { BlogCard, Section } from 'epyc-website'

const CDN = 'https://website-media.epyc.in'

export default function Preview() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32, maxWidth: 900 }}>
        <BlogCard
          href="/blog/design-systems-that-scale"
          title="Design systems that actually scale with your team"
          image={{
            src: `${CDN}/images/projects/7Ql5MP7u1jXJ69ZQUw5e7o1tMU.png`,
            alt: 'Design systems article cover',
            width: 1868,
            height: 1050,
          }}
          date="Jun 2025"
          readTime="6 min read"
          publishedAt="2025-06-01"
        />
        <BlogCard
          href="/blog/webflow-vs-framer"
          title="Webflow vs Framer: which one is right for your marketing site?"
          image={{
            src: `${CDN}/images/projects/lB7xt9A0ReUM3hjaHFTp8kCY9eA.webp`,
            alt: 'Webflow vs Framer article cover',
            width: 1788,
            height: 992,
          }}
          date="May 2025"
          readTime="8 min read"
          publishedAt="2025-05-20"
        />
      </div>
    </Section>
  )
}
