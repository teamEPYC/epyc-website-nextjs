import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { SectionHeading } from '@/components/ui/section-heading'
import { Reveal } from '@/components/ui/reveal'
import { DotLineDivider } from '@/components/ui/dot-line-divider'
import { PaperBackground } from '@/components/ui/paper-background'
import { EpycMark } from '@/components/icons/epyc-mark'
import { Sparkle } from '@/components/icons/sparkle'
import { aboutCapabilities, aboutClients, aboutMilestones, aboutPrinciples } from '@/data/about'

const HERO_IMAGE = 'https://framerusercontent.com/images/rV5jBk0jBJfsfnlEdgFHud9abY.webp'
const DETAIL_IMAGE = 'https://framerusercontent.com/images/c7C4RZlnVXgsMtYKORFY3DNffs.webp'
const BUTTERFLY = 'https://framerusercontent.com/images/ytaCR7YksH4wtdWD4UKUk1bf0Y.png'

export function AboutPage() {
  return (
    <>
      <section className="w-full bg-beige p-4">
        <div className="relative overflow-hidden border-t border-r border-l border-ink px-4 py-8 sm:px-6 sm:py-10 lg:px-6">
          <Container width="outer" className="flex flex-col items-center gap-14 px-0 sm:px-0 lg:gap-20 lg:px-0">
            <Link href="/" aria-label="EPYC home" className="flex w-[72px] items-center justify-center">
              <EpycMark className="h-auto w-full text-ink" />
            </Link>

            <Reveal className="grid w-full gap-10 lg:grid-cols-[minmax(0,1.02fr)_minmax(320px,0.72fr)] lg:items-end lg:gap-[60px]">
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-6">
                  <p className="text-body-sm uppercase text-ink/70">/ About EPYC /</p>
                  <h1 className="max-w-[900px] text-display text-ink">
                    A small studio for teams that need the web to feel considered, fast, and alive.
                  </h1>
                </div>

                <div className="flex max-w-[780px] flex-col items-start gap-6">
                  <p className="text-body-lg text-ink/82">
                    EPYC is a design and development studio building websites, digital products, and no-code systems for ambitious companies. We work where brand, product, and speed meet — turning complex ideas into sharp digital experiences that teams can actually keep moving.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="filled" icon="arrow-right" href="/contact">
                      Start your project
                    </Button>
                    <Button variant="outline" href="/projects">
                      See our work
                    </Button>
                  </div>
                </div>
              </div>

              <div className="relative min-h-[360px] overflow-hidden rounded-sm border border-ink bg-ink lg:min-h-[520px]">
                <Image
                  src={HERO_IMAGE}
                  alt="EPYC studio visual detail"
                  fill
                  priority
                  sizes="(min-width: 1200px) 500px, 100vw"
                  className="object-cover object-center opacity-90 grayscale-[18%]"
                />
                <div aria-hidden="true" className="absolute inset-0 bg-ink/20" />
                <div className="absolute right-4 bottom-4 left-4 flex items-center justify-between border-t border-cream/45 pt-4 text-cream">
                  <span className="text-body-sm uppercase">Design</span>
                  <Sparkle size={15} />
                  <span className="text-body-sm uppercase">Development</span>
                </div>
              </div>
            </Reveal>

            <DotLineDivider />

            <Reveal className="grid w-full gap-4 sm:grid-cols-3 lg:gap-6">
              {aboutMilestones.map((item) => (
                <article key={item.label} className="flex min-h-[220px] flex-col justify-between gap-8 rounded-sm border border-ink/30 bg-cream/45 p-5 lg:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-display text-crimson">{item.value}</p>
                    <p className="max-w-[145px] pt-3 text-right text-body-sm uppercase text-ink/70">{item.label}</p>
                  </div>
                  <p className="text-body text-ink/78">{item.body}</p>
                </article>
              ))}
            </Reveal>
          </Container>
        </div>
      </section>

      <PaperBackground className="bg-ink px-4 py-12 text-cream lg:px-6 lg:py-16" gradient="none">
        <Container width="content" className="flex flex-col gap-12 px-0 sm:px-0 lg:gap-16 lg:px-0">
          <Reveal className="grid gap-10 lg:grid-cols-[0.82fr_1fr] lg:items-start lg:gap-20">
            <div className="flex flex-col gap-6">
              <p className="text-body-sm uppercase text-cream/70">/ Why we exist /</p>
              <SectionHeading as="h2" tone="cream" size="h2-light" className="max-w-[520px]">
                Great companies deserve digital experiences that are easier to trust.
              </SectionHeading>
            </div>
            <div className="flex flex-col gap-6">
              <p className="text-body-lg text-cream/88">
                Teams come to EPYC when the stakes are higher than “make it look good.” A site has to explain the category, make the company credible, help the sales team move faster, and still be simple enough for the marketing team to update after launch.
              </p>
              <p className="text-body text-cream/72">
                That is why we combine careful design direction with pragmatic no-code and low-code development. The result is a polished surface, a manageable system, and a launch process with fewer handoffs.
              </p>
            </div>
          </Reveal>

          <Reveal className="grid gap-[10px] sm:grid-cols-2 lg:grid-cols-4">
            {aboutPrinciples.map((principle) => (
              <article key={principle.title} className="flex min-h-[260px] flex-col justify-between gap-8 border border-cream/35 p-5 lg:p-6">
                <h3 className="text-h3 text-cream">{principle.title}</h3>
                <p className="text-body text-cream/72">{principle.body}</p>
              </article>
            ))}
          </Reveal>
        </Container>
      </PaperBackground>

      <Section tone="beige" className="px-4 py-12 lg:px-6 lg:py-16">
        <Container width="content" className="px-0 sm:px-0 lg:px-0">
          <Reveal className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
            <div className="relative min-h-[420px] overflow-hidden border border-ink bg-cream lg:min-h-[620px]">
              <Image
                src={DETAIL_IMAGE}
                alt="Warm EPYC visual detail"
                fill
                sizes="(min-width: 1200px) 520px, 100vw"
                className="object-cover"
              />
              <Image
                src={BUTTERFLY}
                alt=""
                aria-hidden="true"
                width={115}
                height={115}
                className="pointer-events-none absolute right-8 top-8 h-auto w-[84px] lg:w-[115px]"
              />
            </div>

            <div className="flex flex-col gap-10">
              <div className="flex flex-col gap-5">
                <p className="text-body-sm uppercase text-ink/65">/ What we build /</p>
                <SectionHeading as="h2" size="h2" tone="ink">
                  Designed like a studio. Built like a launch team.
                </SectionHeading>
                <p className="text-body-lg text-ink/82">
                  We help founders, operators, and marketing teams turn high-intent moments into digital systems: websites, product interfaces, CMS-backed content, no-code apps, and launch-ready brand experiences.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-[10px] sm:grid-cols-3">
                {aboutCapabilities.map((capability) => (
                  <div key={capability} className="rounded-pill border border-ink/20 px-4 py-3 text-center text-body-sm uppercase text-ink/78">
                    {capability}
                  </div>
                ))}
              </div>

              <div className="border-t border-ink/30 pt-8">
                <p className="mb-5 text-body-sm uppercase text-ink/65">/ Trusted by teams at /</p>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
                  {aboutClients.map((client) => (
                    <p key={client} className="text-h4 text-ink">
                      {client}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section tone="cream" className="px-4 py-12 lg:px-6 lg:py-16">
        <Container width="content" className="px-0 sm:px-0 lg:px-0">
          <Reveal className="grid gap-10 border-y border-ink py-10 lg:grid-cols-[0.9fr_1fr] lg:items-center lg:gap-20 lg:py-14">
            <SectionHeading as="h2" size="h2" tone="ink">
              We only work with three new customers at a time.
            </SectionHeading>
            <div className="flex flex-col gap-6">
              <p className="text-body-lg text-ink/82">
                It keeps the partnership focused: direct access, quicker decisions, and enough room for craft to survive the deadline.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="filled" icon="arrow-right" href="/contact">
                  Talk to us
                </Button>
                <Button variant="outline" href="/gallery">
                  Browse the gallery
                </Button>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  )
}
