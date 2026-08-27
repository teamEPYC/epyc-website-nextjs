import { GalleryCard, Section } from 'epyc-website'

// GalleryCard takes a single `item` matching the GalleryItem shape. Real
// gallery items come from the CMS at runtime, so these are literals in that
// shape pointing at production imagery. The card sizes itself from
// width/height, which is what makes the masonry layout stable.
const items = [
  {
    slug: 'polygon-marketing-site',
    kind: 'image' as const,
    src: 'https://epyc.in/images/projects/7Ql5MP7u1jXJ69ZQUw5e7o1tMU.png',
    alt: 'Polygon marketing site',
    width: 1868,
    height: 1050,
  },
  {
    slug: 'plum-hq-benefits',
    kind: 'image' as const,
    src: 'https://epyc.in/images/projects/lB7xt9A0ReUM3hjaHFTp8kCY9eA.webp',
    alt: 'Plum HQ benefits platform',
    width: 1788,
    height: 992,
  },
]

export function Single() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <div style={{ maxWidth: 420 }}>
        <GalleryCard item={items[0]} />
      </div>
    </Section>
  )
}

export function Masonry() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <div style={{ columnCount: 2, columnGap: 10, maxWidth: 760 }}>
        {items.map((item) => (
          <GalleryCard key={item.slug} item={item} />
        ))}
      </div>
    </Section>
  )
}
