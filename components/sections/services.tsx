import { Container } from '@/components/ui/container'
import { ServiceCard } from '@/components/ui/service-card'
import { ServicesStamp } from '@/components/ui/services-stamp'
import { Reveal } from '@/components/ui/reveal'
import { services } from '@/data/services'
import { PaperBackground } from '../ui/paper-background'

export function Services() {
  return (
    <PaperBackground className="relative flex h-screen max-h-[1080px] w-full items-center justify-center overflow-hidden bg-ink px-6 py-12">
      {/* Cross-divider lines — positioned at the section level so the
          horizontal can span full viewport width (not clipped to the
          Container's max-width). Hidden on mobile. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 top-1/2 hidden h-[2px] -translate-y-1/2 bg-beige sm:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-[2px] -translate-x-1/2 bg-beige sm:block"
      />

      <Container width="content" className="relative flex h-full flex-1 flex-col items-center justify-center">
        <Reveal as="div" className="flex h-full w-full flex-1 flex-col items-center justify-center">
          <div className="relative grid h-full w-full grid-cols-2 grid-rows-2">
            {services.map((s) => (
              <div
                key={s.title}
                className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden p-6 sm:p-10 lg:p-16"
              >
                <ServiceCard title={s.title} body={s.body} />
              </div>
            ))}
          </div>
        </Reveal>
      </Container>

      {/* Crimson stamp at the section center — sits on top of the cross */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 sm:block">
        <ServicesStamp />
      </div>
    </PaperBackground>
  )
}
