import type { Metadata } from 'next'
import { ChatbotTool } from '@/components/sections/chatbot-tool'
import { CTAFooter } from '@/components/sections/cta-footer'
import { Button } from '@/components/ui/button'

/**
 * The tool is a single client section that owns its own chrome, including the
 * nav — the screens alternate between ink and beige, so the nav's tone has to
 * follow the phase.
 *
 * Plan: docs/ai-chatbot-plan.md · Architecture: docs/ai-chatbot-architecture.md
 * Build reference: docs/ai-chatbot-tech.md
 *
 * Left out of the sitemap deliberately until the tool actually works — see
 * step 8 (Launch) in the plan.
 */
export const metadata: Metadata = {
  title: 'Can an AI read your website?',
  description:
    'Paste your website address. We read up to 20 pages, build a chatbot from what we find, and show you which of the 10 questions a buyer asks your site cannot answer.',
  alternates: { canonical: '/tools/ai-chatbot' },
  // Wireframe — keep it out of the index until the tool is real.
  robots: { index: false, follow: false },
}

export default function AiChatbotToolPage() {
  return (
    <>
      {/* The nav lives inside `ChatbotTool`: the idle hero carries it inside its
          paper frame like the homepage, and every later screen needs it in the
          tone of the screen underneath it. */}
      <ChatbotTool />

      <CTAFooter
        eyebrow="/Start your project/"
        heading="Great companies deserve websites that answer."
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
