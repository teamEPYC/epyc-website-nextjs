import type { ReactNode } from 'react'
import { SiteNav } from '@/components/site-nav'
import { SectionHeading } from '@/components/ui/section-heading'

type LegalPageProps = { title: string; children: ReactNode }

export function LegalPage({ title, children }: LegalPageProps) {
  return (
    <section className="w-full bg-beige p-4">
      <div className="relative flex flex-col items-center gap-10 border-t border-r border-l border-ink px-0 py-10 sm:px-6 sm:py-12 lg:gap-14">
        <SiteNav className="self-stretch -mt-10 sm:-mx-6 sm:-mt-12" />
        <SectionHeading
          as="h1"
          size="display"
          tone="ink"
          className="self-stretch text-center mt-10 leading-[1.1em]!"
        >
          {title}
        </SectionHeading>

        <div className="legal-prose w-[90%] max-w-outer tablet:mx-auto">{children}</div>
      </div>
    </section>
  )
}
