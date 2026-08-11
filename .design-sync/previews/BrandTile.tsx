import { BrandTile, Section } from 'epyc-website'

const CDN = 'https://epyc.in'

// src + alt pairs taken verbatim from data/brands.ts so the logos and their
// labels actually correspond.
const brands = [
  { src: '3Y807gIg19CCRqNIdIO62NOMum4.svg', alt: 'Polygon logo' },
  { src: 'Ri8uHoLFKV1w5HuSWpoz48izDIg.svg', alt: 'Nova Benefits logo' },
  { src: 'F84ZfqSSRZ1w4GDWntpeLNBe8CQ.svg', alt: 'Matrix Partners logo' },
  { src: 'RgRhTEJ1YzYkh09IZiupMAIBsLM.svg', alt: 'Amazon logo' },
  { src: '0AqpBMqtZ9vaBufal9pWoWLHJfI.svg', alt: 'Indian Institute of Science logo' },
  { src: '8bxLk37MO3lp4dJbClTpiZ4N8QI.svg', alt: 'SeedToScale logo' },
]

export function OnDark() {
  return (
    <Section tone="ink" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {brands.slice(0, 3).map((b) => (
          <BrandTile key={b.src} src={`${CDN}/images/brands/${b.src}`} alt={b.alt} />
        ))}
      </div>
    </Section>
  )
}

export function Wall() {
  return (
    <Section tone="ink" style={{ padding: '32px' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 16,
          maxWidth: 640,
        }}
      >
        {brands.map((b) => (
          <BrandTile key={b.src} src={`${CDN}/images/brands/${b.src}`} alt={b.alt} />
        ))}
      </div>
    </Section>
  )
}
