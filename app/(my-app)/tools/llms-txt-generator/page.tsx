import type { Metadata } from 'next'
import { LlmsTxtTool } from '@/components/sections/llms-txt-tool'
import { CTAFooter } from '@/components/sections/cta-footer'
import { Button } from '@/components/ui/button'

/**
 * The tool is a single client section that owns its own chrome, including the
 * nav — the screens alternate between ink and beige, so the nav's tone has to
 * follow the phase.
 *
 * Plan: docs/llms-txt-plan.md · Architecture: docs/llms-txt-architecture.md
 *
 * Left out of the sitemap deliberately until the tool has run against real
 * sites — see step 7 (Launch) in the plan.
 */
export const metadata: Metadata = {
  title: 'llms.txt Generator',
  description:
    'Paste your website address. We read up to 20 pages, write you a ready-to-publish llms.txt, and show you every page whose own words never said what it was for.',
  alternates: { canonical: '/tools/llms-txt-generator' },
  // Not indexed until the tool has been run against real sites.
  robots: { index: false, follow: false },
}

export default function LlmsTxtGeneratorPage() {
  return (
    <>
      {/* The nav lives inside `LlmsTxtTool`: the idle hero carries it inside its
          paper frame like the homepage, and every later screen needs it in the
          tone of the screen underneath it. */}
      <LlmsTxtTool />

      <CTAFooter
        eyebrow="/Start your project/"
        heading="Great companies deserve websites that explain themselves."
        actions={
          <>
            <Button variant="filled" icon="arrow-right" href="/contact">
              Talk to us
            </Button>
            <Button variant="outline" data-on-dark="true" icon="arrow-right" href="/projects">
              See our work
            </Button>
          </>
        }
      />
    </>
  )
}
