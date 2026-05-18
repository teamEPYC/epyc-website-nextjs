import type { Metadata } from 'next'
import { GalleryIndex } from '@/components/sections/gallery-index'
import { FAQs } from '@/components/sections/faqs'
import { CTAFooter } from '@/components/sections/cta-footer'

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Stills, motion clips, and prototypes from the EPYC studio.',
  alternates: { canonical: '/gallery' },
}

export default function GalleryPage() {
  return (
    <>
      <GalleryIndex />
      <FAQs />
      <CTAFooter />
    </>
  )
}
