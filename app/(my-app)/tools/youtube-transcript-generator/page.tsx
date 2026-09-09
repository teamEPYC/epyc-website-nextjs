import type { Metadata } from 'next'
import { YoutubeTranscriptTool } from '@/components/sections/youtube-transcript-tool'
import { CTAFooter } from '@/components/sections/cta-footer'
import { FAQs } from '@/components/sections/faqs'
import { Button } from '@/components/ui/button'
import { youtubeTranscriptFaqs } from '@/data/youtube-transcript-faqs'

/**
 * The tool is a single client section that owns its own chrome, including the
 * nav — the screens alternate between ink and beige, so the nav's tone has to
 * follow the phase.
 *
 * Plan: docs/youtube-transcript-plan.md
 * Architecture: docs/youtube-transcript-architecture.md
 *
 * **Indexed, unlike the other two tools.** `/tools/ai-chatbot` and
 * `/tools/llms-txt-generator` are diagnostics that end in a finding about the
 * visitor's own site, and they stay `noindex` until they have been run against
 * real ones. This page has no finding — it is a giveaway built to rank on its
 * own keyword — so being found is the entire point of it. That is also why it
 * carries FAQ JSON-LD and the other two do not.
 */
export const metadata: Metadata = {
  title: 'YouTube Transcript Generator — Free, No Signup',
  description:
    'Paste any YouTube link and get the full transcript free — plain text, with timestamps, or as an SRT or VTT subtitle file. No signup, no watermark.',
  alternates: { canonical: '/tools/youtube-transcript-generator' },
}

/**
 * Harvested into the markdown representation of this page as well as by search
 * engines. The accordion below is client state, so it server-renders no
 * answers — without this block an agent reading the page would find the
 * questions and none of the replies. See CLAUDE.md → Markdown for Agents.
 */
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: youtubeTranscriptFaqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: { '@type': 'Answer', text: faq.answer },
  })),
}

const appJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'YouTube Transcript Generator',
  url: 'https://epyc.in/tools/youtube-transcript-generator',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  description:
    'Free tool that turns any public YouTube video with captions into a transcript, as plain text, timestamped lines, SRT or VTT.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  provider: { '@type': 'Organization', name: 'EPYC', url: 'https://epyc.in' },
}

export default function YoutubeTranscriptGeneratorPage() {
  return (
    <>
      {/* The nav lives inside `YoutubeTranscriptTool`: the idle hero carries it
          inside its paper frame like the homepage, and every later screen needs
          it in the tone of the screen underneath it. */}
      <YoutubeTranscriptTool />

      <FAQs items={youtubeTranscriptFaqs} />

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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
      />
    </>
  )
}
