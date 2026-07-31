import { Container } from '@/components/ui/container'
import { Pill } from '@/components/ui/pill'
import { Reveal } from '@/components/ui/reveal'

const steps = [
  {
    num: '01',
    title: 'Discovery',
    body: 'Map the site to outcomes, not page count.',
  },
  {
    num: '02',
    title: 'Design',
    body: 'Pixel-perfect screens, see real design early, iterate fast.',
  },
  {
    num: '03',
    title: 'Build',
    body: 'Develop on the platform that fits, with praised interactions.',
  },
  {
    num: '04',
    title: 'Launch & beyond',
    body: 'Optimize, QA, ship. Then stay a partner.',
  },
]

export function ProcessNew() {
  return (
    <section className="relative w-full bg-beige py-[60px] lg:py-[100px]">
      <Container width="content" className="flex flex-col gap-12 lg:gap-20">
        {/* Header */}
        <Reveal className="flex flex-col gap-6 max-w-[740px]">
          <Pill tone="ink-on-light">How we work</Pill>

          <h2 className="text-h1 text-ink">
            Four steps, no slow
            <br />
            agency cycles.
          </h2>
        </Reveal>

        {/* Steps */}
        <Reveal className="flex flex-col gap-12 lg:gap-16">
          {/* Number badges row */}
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.num}
                className="flex h-[54px] w-[54px] items-center justify-center rounded-[70px] bg-crimson"
              >
                <span className="font-serif text-[16px] leading-none text-cream">{step.num}</span>
              </div>
            ))}
          </div>

          {/* Step descriptions */}
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.num} className="flex flex-col gap-4">
                <h3 className="text-h3 text-ink">{step.title}</h3>
                <p className="text-body text-ink/70 max-w-[245px]">{step.body}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
