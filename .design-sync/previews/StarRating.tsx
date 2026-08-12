import { StarRating, Section, ClutchWordmark } from 'epyc-website'

// Note: the stars are always whole glyphs — `score` only changes the numeric
// label, it does not part-fill a star.
export function WithScore() {
  return (
    <Section tone="ink" style={{ padding: '32px' }}>
      <StarRating score={5} outOf={5} showScore />
    </Section>
  )
}

export function StarsOnly() {
  return (
    <Section tone="ink" style={{ padding: '32px' }}>
      <StarRating score={5} outOf={5} showScore={false} />
    </Section>
  )
}

export function WithLogo() {
  return (
    <Section tone="ink" style={{ padding: '32px' }}>
      {/* ClutchWordmark is viewBox-only — it needs an explicit height or it
          collapses inside the rating's flex row. */}
      <StarRating score={4.9} outOf={5} logo={<ClutchWordmark style={{ height: 16, width: 'auto' }} />} />
    </Section>
  )
}
