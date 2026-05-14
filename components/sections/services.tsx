import Image from 'next/image'
import { Container } from '@/components/ui/container'
import { ServiceCard } from '@/components/ui/service-card'
import { ServicesStamp } from '@/components/ui/services-stamp'
import { Reveal } from '@/components/ui/reveal'
import { services } from '@/data/services'
import { PaperBackground } from '../ui/paper-background'

export function Services() {
  return (
    <PaperBackground className="max-h-[1080p] w-full relative flex h-screen items-center justify-center overflow-hidden bg-ink px-6 py-12">
      {/* <section className="relative flex min-h-screen w-full overflow-hidden bg-ink px-6 py-12"> */}
      {/* <Image
        src="https://framerusercontent.com/images/4svPWouJqvqnznpkeku35FoPOY.webp"
        alt=""
        fill
        sizes="100vw"
        className="-z-10 object-cover opacity-90"
      /> */}
      <Container width="content" className="relative flex flex-1 flex-col">
        <Reveal as="div" className="flex flex-1 flex-col">
          <div className="relative flex flex-1">
            <div className="grid w-full flex-1 grid-cols-1 sm:grid-cols-2 sm:grid-rows-2">
              {services.map((s, i) => (
                <div
                  key={s.title}
                  className={[
                    'flex items-stretch border-cream/25',
                    // internal grid dividers (no outer border)
                    i % 2 === 0 ? 'sm:border-r' : '',
                    i < 2 ? 'sm:border-b' : '',
                    // vertical separator on mobile (single column)
                    i > 0 ? 'border-t sm:border-t-0' : '',
                  ].join(' ')}
                >
                  <ServiceCard title={s.title} body={s.body} />
                </div>
              ))}
            </div>
            {/* Crimson stamp sits exactly on the crosshair intersection of the 2×2 grid */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 sm:block">
              <ServicesStamp />
            </div>
          </div>
        </Reveal>
      </Container>
      {/* </section> */}
    </PaperBackground>
  )
}
