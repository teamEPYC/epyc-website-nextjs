import Image from 'next/image'
import { Section } from '@/components/ui/section'
import { Reveal } from '@/components/ui/reveal'
import { Container } from '@/components/ui/container'
import { SectionHeading } from '@/components/ui/section-heading'

export function AiNothingChanged() {
  return (
    <Section tone="beige">
      <Container width="wide">
        <Reveal className="flex flex-col gap-12 lg:gap-[60px]">
          {/* Banner image — 1256×510, sharp corners (Figma) */}
          <div className="relative aspect-[1256/510] w-full overflow-hidden">
            <Image
              src="/images/ai-training/nothing-changed.png"
              alt="A team seated around a table watching a colleague present a workflow diagram"
              fill
              sizes="(max-width: 1200px) 100vw, 1256px"
              className="object-cover"
            />
          </div>

          {/* Heading col ≈620px, body col fills the rest */}
          <div className="grid grid-cols-1 gap-6 text-center lg:grid-cols-2 lg:gap-4 lg:text-left">
            {/* Figma (3787:47190) wraps to 3 lines in a 620px box:
                  / Your team already sat
                  through an AI training.
                  Nothing changed. /
                It sets no hard break — but Figma draws this at Rationalist
                Medium (500) and we load only Regular (400), so the narrower
                lines wrap elsewhere on their own. Forced at lg only; below lg
                the text wraps naturally. */}
            <SectionHeading size="h2" tone="ink" className="mx-auto max-w-[620px] lg:mx-0">
              Your team already sat{' '}
              <br className="hidden lg:inline" />
              through an AI training.{' '}
              <br className="hidden lg:inline" />
              Nothing changed.
            </SectionHeading>
            {/* Top-aligned with a 10px offset from the heading's cap line (Figma 3787:47191) */}
            <p className="mx-auto max-w-[501px] text-body-lg text-ink lg:mx-0 lg:pt-[10px]">
              Most AI training is a lecture. It covers prompting basics, name-drops a few tools, and
              ends with a slide that says &ldquo;now go be innovative.&rdquo; Six months later,
              nothing has shipped. Teams that don&apos;t build under real constraints don&apos;t
              retain what they learned. They retain that AI training was a waste of a day.
            </p>
          </div>
        </Reveal>
      </Container>
    </Section>
  )
}
