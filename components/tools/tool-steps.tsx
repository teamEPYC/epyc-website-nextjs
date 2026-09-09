import { Container } from '@/components/ui/container'
import { Disc } from '@/components/ui/disc'
import { Reveal } from '@/components/ui/reveal'
import { Section } from '@/components/ui/section'

/**
 * The three-up "how it works" band under every tool's URL screen.
 *
 * All three tools explain themselves in exactly three numbered steps, in the
 * same beige band, and the markup was identical in all of them down to the
 * class strings — only the words differed. So the words are the prop.
 *
 * Fixed at three columns on `sm` because that is the design; a tool needing a
 * different count should say so here rather than pass a grid class in.
 */
export type ToolStep = readonly [number: string, title: string, blurb: string]

export function ToolSteps({ steps }: { steps: readonly ToolStep[] }) {
  return (
    <Section tone="beige">
      <Container>
        <Reveal>
          <div className="grid gap-12 py-6 sm:grid-cols-3">
            {steps.map(([n, title, blurb]) => (
              <div key={n} className="flex flex-col items-start gap-4">
                <Disc>{n}</Disc>
                <h3 className="text-h4-alt text-ink">{title}</h3>
                <p className="text-body text-ink/70">{blurb}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </Section>
  )
}
