import { Marquee, Section, BrandTile, Pill } from 'epyc-website'

const CDN = 'https://epyc.in'
const logos = [
  { src: '3Y807gIg19CCRqNIdIO62NOMum4.svg', alt: 'Polygon logo' },
  { src: 'Ri8uHoLFKV1w5HuSWpoz48izDIg.svg', alt: 'Nova Benefits logo' },
  { src: 'F84ZfqSSRZ1w4GDWntpeLNBe8CQ.svg', alt: 'Matrix Partners logo' },
  { src: 'RgRhTEJ1YzYkh09IZiupMAIBsLM.svg', alt: 'Amazon logo' },
]

// Infinite auto-scrolling strip: children are rendered twice and the track is
// animated -50% so the seam is invisible. It pauses on hover and honours
// prefers-reduced-motion, so a still capture shows the strip mid-track.
export function BrandStrip() {
  return (
    <Section tone="ink" style={{ padding: '32px 0' }}>
      <Marquee>
        {logos.map((l) => (
          <BrandTile key={l.src} src={`${CDN}/images/brands/${l.src}`} alt={l.alt} />
        ))}
      </Marquee>
    </Section>
  )
}

export function TextStrip() {
  return (
    <Section tone="beige" style={{ padding: '32px 0' }}>
      <Marquee gap={32}>
        {['Webflow', 'Framer', 'UI / UX', 'Design Systems', 'Interactions'].map((t) => (
          <Pill key={t} tone="ink-on-light">
            {t}
          </Pill>
        ))}
      </Marquee>
    </Section>
  )
}
