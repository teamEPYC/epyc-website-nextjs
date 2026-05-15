import type { Metadata } from 'next'
import { BlogIndex } from '@/components/sections/blog-index'
import { CTAFooter } from '@/components/sections/cta-footer'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Get into our minds and understand how we do the things we do.',
  alternates: { canonical: '/blogs' },
}

export default function BlogsPage() {
  return (
    <>
      <BlogIndex />
      <CTAFooter />
    </>
  )
}
