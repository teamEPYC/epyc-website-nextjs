import Image from 'next/image'
import { Container } from '@/components/ui/container'
import { SectionHeading } from '@/components/ui/section-heading'
import { FAQItem } from '@/components/ui/faq-item'
import { Reveal } from '@/components/ui/reveal'
import { faqs } from '@/data/faqs'
import { PaperBackground } from '../ui/paper-background'

export function FAQs() {
  return (
    <section className="relative w-full overflow-hidden bg-ink px-6 py-12">
      {/* Full-bleed background texture. `z-0` keeps it above the section's
          `bg-ink` fill but below the content — a negative z-index sinks it
          behind `bg-ink` and hides it entirely. */}
      <Image
        src="/images/site/kyS26IYlxhpf1ogFNR9ihcWa8Q.jpg"
        alt=""
        fill
        loading="eager"
        sizes="100vw"
        className="z-0 object-cover"
      />
      <Container width="content" className="relative z-10">
        <Reveal className="flex flex-col gap-20">
          <div className="flex justify-center">
            <SectionHeading tone="cream">Questions?</SectionHeading>
          </div>
          <div className="flex flex-col">
            {faqs.map((f) => (
              <FAQItem key={f.question} question={f.question}>
                {f.answer}
              </FAQItem>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
