import { SiteNav } from '@/components/site-nav'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'

/**
 * The nav bar on every tool screen except the hero, which carries its own
 * inside its paper frame. Tone follows the screen underneath it so the mark
 * and links inherit the right colour.
 *
 * Shared by the free tools — lifted out of `chatbot-tool.tsx` when the
 * llms.txt generator needed the same thing.
 *
 * `transparent` is for a screen that paints its own background — a
 * `<PaperBackground>` result screen, say. Rendered above one, an `ink` nav
 * draws a band of flat green over the texture and the seam is visible; nested
 * inside it, `transparent` lets the texture run behind the nav unbroken. The
 * caller owns the text colour in that case, as it owns the background.
 */
export function ToolNav({ tone }: { tone: 'ink' | 'beige' | 'transparent' }) {
  return (
    <Section tone={tone} className="pb-0">
      <Container>
        <SiteNav className="self-stretch -mx-4 -mt-8 sm:-mx-6 sm:-mt-10 lg:-mx-15" />
      </Container>
    </Section>
  )
}
