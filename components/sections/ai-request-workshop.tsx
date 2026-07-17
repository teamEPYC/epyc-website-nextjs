import { Reveal } from '@/components/ui/reveal'
import { Container } from '@/components/ui/container'
import { SectionHeading } from '@/components/ui/section-heading'
import { OrnamentDivider } from '@/components/ui/ornament-divider'
import { Pill } from '@/components/ui/pill'
import Image from 'next/image'
import { AiWorkshopForm } from '@/components/sections/ai-workshop-form'

/**
 * Figma "Tell us about your team" (3787:47684) — charcoal section, cream copy
 * on the left with a bottom-pinned reassurance note, beige form card on the
 * right. The form is a single step, so the Figma frame's "Step 1 of 2" marker
 * isn't rendered.
 */
export function AiRequestWorkshop() {
  return (
    // `id` is the scroll target for the "Request a Workshop" CTAs in the hero
    // and footer — same pattern as the contact page's `id="form"`.
    <section id="request-workshop" className="relative isolate overflow-hidden bg-ink">
      {/* Full-bleed background texture. `z-0` keeps it above the section's
          `bg-ink` fill but below the content — same treatment as <FAQs> and
          <CTAFooter>. */}
      <Image
        src="/images/site/kyS26IYlxhpf1ogFNR9ihcWa8Q.jpg"
        alt=""
        fill
        loading="eager"
        sizes="100vw"
        className="z-0 object-cover"
      />

      {/* Bottom padding is the house rhythm *plus* 40px, unlike every other
          section. <AiWorkshopForm>'s submit is `-bottom-10 h-[80px]`, so it
          hangs 40px below the card and eats that much of the gap — a plain
          `py-12` left 8px of daylight under the button against 48px above the
          card. 70/88 = 30/48 + 40, which makes the *visible* gap symmetric.
          Keep in step with the submit's offset if that ever changes. */}
      <Container
        width="wide"
        className="relative z-10 pt-[30px] pb-[70px] lg:pt-12 lg:pb-[88px]"
      >
        <Reveal className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-0">
          {/* Copy col */}
          <div className="mx-auto flex w-full max-w-[514px] flex-col items-center gap-10 text-center lg:mx-0 lg:items-start lg:text-left">
            <Pill tone="cream-on-dark">Request a workshop</Pill>
            <div className="flex flex-col gap-6">
              {/* Figma (3787:47694) wraps to 2 lines in a 487px box:
                    / Tell us about your
                    team. /
                  Forced at lg only — see the Medium/Regular
                  substitution that moves the natural wrap. */}
              <SectionHeading size="h2" tone="cream" className="max-w-[487px]">
                Tell us about your{' '}
                <br className="hidden lg:inline" />
                team.
              </SectionHeading>
              {/* 24px serif sub (Figma 3787:47696) */}
              <p className="max-w-[468px] text-h4 text-cream">
                Every workshop is scoped to your team, not sold off a shelf. Fill this in and
                we&apos;ll come back with a custom agenda and a quote.
              </p>
            </div>

            {/* Rule + proof line, borrowing the rhythm of the CTA on
                /website-design-development (page-cta-footer.tsx on main), but
                with <AiMentors>'s ornament rather than that page's dashed rule —
                the knot motif is what this page uses.
                `w-full` because the column is `items-center` until lg, which
                would otherwise shrink the divider to its intrinsic width.
                Figures are <AiTrainedTeams>'s stat row verbatim — see the note
                there; the page states three different "trained" counts. */}
            <div className="flex w-full flex-col gap-8">
              <OrnamentDivider className="text-cream" />
              <p className="text-body text-cream/70">
                50+ workshops · 1,000+ professionals trained · 25+ companies
              </p>
            </div>
          </div>

          {/* Form card — 538 wide, beige, grey border (Figma 3787:47716) */}
          <AiWorkshopForm />
        </Reveal>
      </Container>
    </section>
  )
}
