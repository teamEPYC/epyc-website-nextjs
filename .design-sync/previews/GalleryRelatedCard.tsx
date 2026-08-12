import { GalleryRelatedCard, Section } from 'epyc-website'

// Fixed 16:9 sibling of GalleryCard, used in the "related" rail on a gallery
// detail page. Falls back to a title derived from the slug when `title` is
// absent.
const items = [
  {
    slug: 'polygon-marketing-site',
    kind: 'image' as const,
    src: 'https://epyc.in/images/projects/7Ql5MP7u1jXJ69ZQUw5e7o1tMU.png',
    alt: 'Polygon marketing site',
    width: 1868,
    height: 1050,
    title: 'Polygon',
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
      <div style={{ maxWidth: 380 }}>
        <GalleryRelatedCard item={items[0]} />
      </div>
    </Section>
  )
}

export function RelatedRail() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 760 }}>
        {items.map((item) => (
          <GalleryRelatedCard key={item.slug} item={item} />
        ))}
      </div>
    </Section>
  )
}
