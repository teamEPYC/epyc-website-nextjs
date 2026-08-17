import type { Metadata } from 'next'
import { SiteNav } from '@/components/site-nav'
import { ChatbotTool } from '@/components/sections/chatbot-tool'
import { CTAFooter } from '@/components/sections/cta-footer'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'

/**
 * WIREFRAME — not wired to anything yet.
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
      <Section tone="beige" className="pb-0">
        <Container>
          <SiteNav className="self-stretch -mx-4 -mt-8 sm:-mx-6 sm:-mt-10 lg:-mx-15" />
        </Container>
      </Section>

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
