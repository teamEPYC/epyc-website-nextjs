import { StarRating, Section } from 'epyc-website'

export default function Preview() {
  return (
    <Section tone="ink" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <StarRating score={5} outOf={5} showScore />
        <StarRating score={4.8} outOf={5} showScore />
        <StarRating score={5} outOf={5} />
      </div>
    </Section>
  )
}
