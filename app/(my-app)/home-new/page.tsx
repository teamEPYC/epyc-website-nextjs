import type { Metadata } from 'next'
import { HeroNew } from '@/components/sections/hero-new'
import { ServicesNew } from '@/components/sections/services-new'
import { ProcessNew } from '@/components/sections/process-new'
import { FeaturedProjects } from '@/components/sections/featured-projects'
import { Voices } from '@/components/sections/voices'
import { CTAFooterNew } from '@/components/sections/cta-footer-new'

export const metadata: Metadata = {
  title: 'EPYC v4 — Homepage Preview',
  robots: { index: false, follow: false },
}

export default function HomeNew() {
  return (
    <>
      <HeroNew />
      <ServicesNew />
      <ProcessNew />
      <FeaturedProjects />
      <Voices />
      <CTAFooterNew />
    </>
  )
}
