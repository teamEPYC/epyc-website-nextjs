import type { Metadata } from 'next'
import { ContactHero } from '@/components/sections/contact-hero'
import { FAQs } from '@/components/sections/faqs'
import { ExclusivityCTA } from '@/components/sections/exclusivity-cta'
import { CTAFooter } from '@/components/sections/cta-footer'

export const metadata: Metadata = {
  title: 'Contact',
  description: "Tell us about your project — we'll get back within a business day.",
  alternates: { canonical: '/contact' },
  openGraph: {
    siteName: 'EPYC',
    images: [{ url: '/og/contact.webp', width: 2400, height: 1260, alt: 'EPYC — Contact' }],
  },
}

export default function ContactPage() {
  return (
    <>
      <ContactHero />
      <FAQs />
      <ExclusivityCTA />
      <CTAFooter />
    </>
  )
}
