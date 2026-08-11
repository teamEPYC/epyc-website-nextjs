import { PronounceButton, Section } from 'epyc-website'

// Takes no props: an ink IconButton with a Play glyph that plays the recorded
// "EPYC" pronunciation on click. The audio clip is served from /audio, so in a
// preview the button renders but has nothing to play.
export function Default() {
  return (
    <Section tone="ink" style={{ padding: '32px' }}>
      <PronounceButton />
    </Section>
  )
}

export function BesideAWordmark() {
  return (
    <Section tone="ink" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <span
          style={{
            fontFamily: 'var(--font-rationalist, sans-serif)',
            fontSize: 32,
            color: '#f7efdd',
          }}
        >
          EPYC
        </span>
        <PronounceButton />
      </div>
    </Section>
  )
}
