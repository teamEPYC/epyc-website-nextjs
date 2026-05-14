import { Container } from '@/components/ui/container'
import { ServiceCard } from '@/components/ui/service-card'
import { ServicesStamp } from '@/components/ui/services-stamp'
import { Reveal } from '@/components/ui/reveal'
import { services } from '@/data/services'
import { PaperBackground } from '../ui/paper-background'

export function Services() {
  return (
    <PaperBackground className="relative flex h-screen max-h-[1080px] w-full items-center justify-center overflow-hidden bg-ink px-6 py-12">
      <Container width="content" className="relative flex h-full flex-1 flex-col items-center justify-center">
        <Reveal as="div" className="flex h-full w-full flex-1 flex-col items-center justify-center">
          <div className="relative flex h-full w-full flex-1 items-center justify-center">
            {/* 2×2 grid of service cells. Cells fill the available space; their
                content is centered inside each cell via flex justify-center. */}
            <div className="relative grid h-full w-full grid-cols-2 grid-rows-2">
              {services.map((s) => (
                <div
                  key={s.title}
                  className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden p-6 sm:p-10 lg:p-16"
                >
                  <ServiceCard title={s.title} body={s.body} />
                </div>
              ))}

              {/* Cross-divider lines. Absolutely positioned so the cross is
                  exact at the grid's midpoint, independent of cell sizes. */}
              {/* Horizontal: full width across the section, 2px thick */}
              <div
                aria-hidden
                className="pointer-events-none absolute left-0 right-0 top-1/2 hidden h-[2px] -translate-y-1/2 bg-cream/30 sm:block"
              />
              {/* Vertical: 40px short of the section edges (inset-y-10), 2px wide */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-10 left-1/2 hidden w-[2px] -translate-x-1/2 bg-cream/30 sm:block"
              />
            </div>

            {/* Crimson stamp at the cross intersection */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 sm:block">
              <ServicesStamp />
            </div>
          </div>
        </Reveal>
      </Container>
    </PaperBackground>
  )
}
