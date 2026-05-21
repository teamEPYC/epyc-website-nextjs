import Link from 'next/link'
import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'
import { SectionHeading } from '@/components/ui/section-heading'
import { BlogCard } from '@/components/ui/blog-card'
import { DotLineDivider } from '@/components/ui/dot-line-divider'
import { EpycMark } from '@/components/icons/epyc-mark'
import type { NormalisedBlog } from '@/lib/blogs/normalise'

type BlogIndexProps = { blogs: NormalisedBlog[] }

export function BlogIndex({ blogs }: BlogIndexProps) {

  return (
    <Section tone="beige" className="px-4 py-4 lg:px-4 lg:py-4 ">
      <div className="relative mx-auto w-full px-6 py-11  overflow-hidden border-l border-r border-t border-ink ">
        <Container
          width="outer"
          className="flex flex-col px-0 sm:px-0 lg:px-0 items-center gap-12 lg:gap-10 max-w-outter w-[90%]"
        >
          <div className="flex flex-col items-center justify-center gap-12 lg:gap-24">
            <Link href="/" aria-label="EPYC home" className="inline-block">
              <EpycMark className="h-auto w-[72px] text-ink" />
            </Link>

            <div className="flex w-full flex-col items-center gap-6 lg:gap-[30px]">
              <SectionHeading
                as="h1"
                size="display"
                tone="ink"
                className="text-center leading-[1.1em]!"
              >
                Blog
              </SectionHeading>
              <p className="text-body-lg w-full text-center text-ink ">
                Get into our minds and understand how we do the things we do
              </p>
            </div>
          </div>

          <DotLineDivider />

          {/* Simple on-load entrance (`.load-fade-up` in globals.css) — runs
              once when the page renders, not on scroll. A scroll-reveal here
              broke on tall monitors: the grid is one large element that never
              crossed the IntersectionObserver threshold until you scrolled. */}
          <div className="load-fade-up grid w-full grid-cols-1 gap-10 sm:grid-cols-2">
            {blogs.map((b) => (
              <BlogCard
                key={b.slug}
                href={`/blogs/${b.slug}`}
                title={b.title}
                image={b.image}
                date={b.date}
                readTime={b.readTime}
                publishedAt={b.publishedAt}
              />
            ))}
          </div>
        </Container>
      </div>
    </Section>
  )
}
