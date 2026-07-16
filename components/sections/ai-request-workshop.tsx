import { SparkleFilled } from '@/components/icons'
import { Reveal } from '@/components/ui/reveal'
import { AiContainer } from '@/components/ui/ai-container'
import { SectionHeading } from '@/components/ui/section-heading'
import { Pill } from '@/components/ui/pill'
import { AiTexture } from '@/components/ui/ai-texture'
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
    <section id="request-workshop" className="relative isolate overflow-hidden bg-grey-primary">
      <AiTexture />

      {/* 120 top / 127 bottom — card + note both end at y=824 in the 951px frame */}
      <AiContainer className="py-14 sm:py-20 lg:pt-[120px] lg:pb-[127px]">
        <Reveal className="flex flex-col gap-12 lg:flex-row lg:items-stretch lg:gap-0">
          {/* Copy col — heading block top, note pinned to the bottom */}
          <div className="mx-auto flex w-full max-w-[514px] flex-col gap-12 text-center lg:mx-0 lg:justify-between lg:gap-0 lg:text-left">
            <div className="flex flex-col items-center gap-10 lg:items-start">
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
            </div>

            {/* Reassurance note (Figma 3787:47734) */}
            <div className="flex items-start justify-center gap-6 text-left text-cream lg:justify-start">
              <SparkleFilled />
              <p className="max-w-[403px] text-body-lg">
                We&apos;ll review your request and get back to you within 1 business day.
              </p>
            </div>
          </div>

          {/* Form card — 538 wide, beige, grey border (Figma 3787:47716) */}
          <AiWorkshopForm />
        </Reveal>
      </AiContainer>
    </section>
  )
}
