import type { Metadata } from 'next'
import { Hero } from '@/components/sections/hero'
import { StickyImage } from '@/components/sections/sticky-image'
import { FeaturedProjects } from '@/components/sections/featured-projects'
import { MoreProjects } from '@/components/sections/more-projects'
import { Services } from '@/components/sections/services'
import { Voices } from '@/components/sections/voices'
import { Brands } from '@/components/sections/brands'
import { FAQs } from '@/components/sections/faqs'
import { CTAFooter } from '@/components/sections/cta-footer'
import { faqs } from '@/data/faqs'

// No `title` here: the home page inherits the layout's `title.default`
// ('EPYC | Website Development | Design Studio'), matching production.
export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
}

export default function Home() {
  return (
    <>
      <Hero />
      <StickyImage />
      <FeaturedProjects />
      <MoreProjects />
      <Services />
      <Voices />
      <Brands />
      <FAQs />
      <CTAFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </>
  )
}
