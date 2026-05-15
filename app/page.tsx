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
import { site } from '@/data/site'

export const metadata: Metadata = {
  title: site.tagline,
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
      {/* Section order is the same as DOM order at lg+ (Tailwind's `lg:order-none`
          collapses to 0 on every wrapper, falling back to DOM order). On mobile
          the explicit `order-N` classes shift Services down by two slots so the
          visual flow is: ... More Projects -> Voices -> Brands -> Services -> ... */}
      <div className="order-1 lg:order-none">
        <Hero />
      </div>
      <div className="order-2 lg:order-none">
        <StickyImage />
      </div>
      <div className="order-3 lg:order-none">
        <FeaturedProjects />
      </div>
      <div className="order-4 lg:order-none">
        <MoreProjects />
      </div>
      {/* DOM position 5, mobile slot 7 (after Brands) */}
      <div className="order-7 lg:order-none">
        <Services />
      </div>
      {/* DOM position 6, mobile slot 5 */}
      <div className="order-5 lg:order-none">
        <Voices />
      </div>
      {/* DOM position 7, mobile slot 6 */}
      <div className="order-6 lg:order-none">
        <Brands />
      </div>
      <div className="order-8 lg:order-none">
        <FAQs />
      </div>
      <div className="order-9 lg:order-none">
        <CTAFooter />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </>
  )
}
