import Image from 'next/image'
import type { ReactNode } from 'react'
import { Section } from '@/components/ui/section'
import { SiteNav } from '@/components/site-nav'
import { Container } from '@/components/ui/container'
import { SectionHeading } from '@/components/ui/section-heading'
import { Reveal } from '@/components/ui/reveal'
import { BlogCard } from '@/components/ui/blog-card'
import { BlogProse } from '@/components/ui/blog-prose'
import { DotLineDivider } from '@/components/ui/dot-line-divider'
import { Sparkle } from '@/components/icons/sparkle'
import type { NormalisedBlog } from '@/lib/blogs/normalise'

type BlogPostProps = {
  blog: NormalisedBlog
  body: ReactNode
  relatedBlogs: NormalisedBlog[]
}

export function BlogPost({ blog, body, relatedBlogs }: BlogPostProps) {
  return (
    <Section tone="beige" className="px-4 py-4 lg:px-4 lg:py-4">
      <div className="relative mx-auto w-full overflow-hidden border-l border-r border-t border-ink px-0 py-11">
        <SiteNav className="-mt-11 mb-12" />
        <Container
          width="outer"
          className="flex w-[90%] flex-col items-center gap-0 px-0 sm:px-0 lg:gap-10 lg:px-0"
        >
          <div className="flex flex-col items-center justify-center gap-12 lg:gap-24">
            {/* Hero */}
            <header className="flex w-full flex-col items-center gap-6 lg:gap-[30px]">
              <h1 className="text-[31px] leading-[1.1em]! tablet:text-display text-center text-ink! font-display font-normal">
                {blog.title}
              </h1>
              {(blog.date || blog.readTime) && (
                <div className="flex flex-row items-center gap-2.5 text-h5 uppercase text-ink/60">
                  {blog.date && <time dateTime={blog.publishedAt}>{blog.date}</time>}
                  {blog.date && blog.readTime && <Sparkle size={14} className="shrink-0" />}
                  {blog.readTime && <span>{blog.readTime}</span>}
                </div>
              )}
            </header>
          </div>

          {/* Banner */}
          <div className="relative  w-[90%] mx-auto lg:h-[632px] overflow-hidden rounded-[4px]">
            {blog.image ? (
              <Image
                src={blog.image.src}
                alt={blog.image.alt || blog.title}
                priority
                height={632}
                width={1000}
                className="object-contain mx-auto rounded-[4px] bg-cream"
                style={
                  blog.image.focalX !== undefined && blog.image.focalY !== undefined
                    ? { objectPosition: `${blog.image.focalX}% ${blog.image.focalY}%` }
                    : undefined
                }
              />
            ) : (
              // No cover image — neutral placeholder box in the banner shape.
              // On lg the parent is a fixed 632px tall, so fill it; on smaller
              // screens the parent has no height, so derive it from the ratio.
              <div className="h-full w-full rounded-[4px] bg-bone max-lg:aspect-[1000/632]" />
            )}
          </div>

          {/* Article body */}
          <article className="w-full mt-5 lg:w-[60%] mx-auto">
            <BlogProse>{body}</BlogProse>
          </article>

          {/* Author */}
          <div className="w-full lg:w-[90%] mx-auto flex  flex-col gap-8 mt-10 lg:mx-auto lg:max-w-outer lg:mt-0">
            <div className="flex w-full max-w-[820px] flex-col gap-1">
              <p className="text-h5 uppercase text-ink/60">/AUTHOR</p>
              <p className="text-h5 uppercase text-ink">{blog.author ?? 'Team EPYC'}</p>
            </div>
            <DotLineDivider />

            {/* More Blogs */}
            {relatedBlogs.length > 0 && (
              <>
                <SectionHeading as="h3" size="h3" tone="ink" className="w-full max-w-[820px]">
                  More Blogs
                </SectionHeading>
                <Reveal
                  as="div"
                  className="grid w-full grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {relatedBlogs.map((b) => (
                    <BlogCard
                      key={b.slug}
                      href={`/blog/${b.slug}`}
                      title={b.title}
                      image={b.image}
                      date={b.date}
                      publishedAt={b.publishedAt}
                    />
                  ))}
                </Reveal>

                <DotLineDivider />
              </>
            )}
          </div>
        </Container>
      </div>
    </Section>
  )
}
