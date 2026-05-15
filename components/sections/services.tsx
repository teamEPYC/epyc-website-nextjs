import { Container } from '@/components/ui/container'
import { ServiceCard } from '@/components/ui/service-card'
import { ServicesStamp } from '@/components/ui/services-stamp'
import { Reveal } from '@/components/ui/reveal'
import { services } from '@/data/services'
import { PaperBackground } from '../ui/paper-background'

export function Services() {
  return (
    <PaperBackground className="relative flex h-auto w-full flex-col items-center justify-center overflow-hidden bg-ink px-6 py-12 sm:h-screen sm:max-h-[1080px]">
      {/* Vertical divider — sm+ only, full section height */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-[2px] -translate-x-1/2 bg-beige sm:block"
      />

      {/* Mobile-only heading. Plain h2 (no "/ ... /" slashes) to match the
          design reference; sm+ shows the crimson ServicesStamp instead. */}
      <h2 className="mb-8 text-center text-h2-light text-cream sm:hidden">
        Our Services
      </h2>

      <Container
        width="content"
        className="relative flex w-full flex-col items-center justify-center sm:h-full sm:flex-1"
      >
        <Reveal
          as="div"
          className="flex w-full flex-col items-center justify-center sm:h-full sm:flex-1"
        >
          <div className="relative grid w-full grid-cols-1 gap-12 sm:h-full sm:grid-cols-2 sm:grid-rows-2 sm:gap-0">
            {services.map((s) => (
              <div
                key={s.title}
                className="relative flex w-full flex-col items-center justify-center overflow-hidden p-2 sm:h-full sm:p-10 lg:p-16"
              >
                <ServiceCard title={s.title} body={s.body} />
              </div>
            ))}

            {/* Horizontal divider — sm+ only, bounded to grid width */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-0 right-0 top-1/2 hidden h-[2px] -translate-y-1/2 bg-beige sm:block"
            />
          </div>
        </Reveal>
      </Container>

      {/* Crimson stamp at section center — sm+ only */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 sm:block">
        <ServicesStamp />
      </div>
    </PaperBackground>
  )
}
