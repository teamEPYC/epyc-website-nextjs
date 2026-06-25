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
// No `title` here: the home page inherits the layout's `title.default`
// ('EPYC | Website Development | Design Studio'), matching production.
export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

const provider = { '@type': 'Organization', name: 'EPYC', url: 'https://epyc.in' }

const servicesJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      name: 'Website Design and Development',
      provider,
      serviceType: 'Website Design and Development',
      description:
        'Full-service website design and development for funded startups and ambitious companies. Strategy to launch on Webflow, Framer, WordPress, or custom code.',
      areaServed: 'Worldwide',
      url: 'https://epyc.in',
    },
    {
      '@type': 'Service',
      name: 'UI/UX Design',
      provider,
      serviceType: 'UI/UX Design',
      description:
        'Pixel-perfect interfaces for websites, apps, and digital products. User research, wireframes, interactive prototypes, and design systems.',
      areaServed: 'Worldwide',
      url: 'https://epyc.in',
    },
    {
      '@type': 'Service',
      name: 'Brand and Creative Direction',
      provider,
      serviceType: 'Brand and Creative Direction',
      description:
        'Visual identity, brand systems, and creative strategy for companies launching or rebranding. The intersection of art, design, and technology.',
      areaServed: 'Worldwide',
      url: 'https://epyc.in',
    },
    {
      '@type': 'Service',
      name: 'Web Apps and Internal Tools',
      provider,
      serviceType: 'Web App Development',
      description:
        'No-code and custom web apps and internal tools built on Bubble.io, FlutterFlow, Supabase, or React/Next.js. Validated faster, maintainable without a full engineering team.',
      areaServed: 'Worldwide',
      url: 'https://epyc.in',
    },
  ],
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesJsonLd) }}
      />
    </>
  )
}
