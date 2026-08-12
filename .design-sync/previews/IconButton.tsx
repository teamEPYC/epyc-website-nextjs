import { IconButton, Section, ArrowRight, Play, Plus } from 'epyc-website'

// Circular icon-only affordance. `aria-label` is REQUIRED by the type, and the
// icon must be passed as children — an empty IconButton is just a coloured dot.
export function Tones() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <IconButton tone="ink" aria-label="Next project">
          <ArrowRight size={20} />
        </IconButton>
        <IconButton tone="crimson" aria-label="Play showreel">
          <Play size={20} />
        </IconButton>
      </div>
    </Section>
  )
}

export function OnDark() {
  return (
    <Section tone="ink" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <IconButton tone="cream" aria-label="Next project">
          <ArrowRight size={20} />
        </IconButton>
        <IconButton tone="crimson" aria-label="Add">
          <Plus size={20} />
        </IconButton>
      </div>
    </Section>
  )
}

export function Sizes() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <IconButton size="sm" aria-label="Small">
          <ArrowRight size={16} />
        </IconButton>
        <IconButton size="md" aria-label="Medium">
          <ArrowRight size={20} />
        </IconButton>
        <IconButton size="lg" aria-label="Large">
          <ArrowRight size={24} />
        </IconButton>
      </div>
    </Section>
  )
}
