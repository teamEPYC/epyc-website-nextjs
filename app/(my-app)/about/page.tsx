import type { Metadata } from 'next'
import { AboutPage } from '@/components/sections/about-page'
import { CTAFooter } from '@/components/sections/cta-footer'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Meet EPYC — a boutique design and development studio building websites, products, and no-code systems for ambitious teams.',
  alternates: { canonical: '/about' },
}

export default function AboutRoute() {
  return (
    <>
      <AboutPage />
      <CTAFooter />
    </>
  )
}
