import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { PaperBackground } from '@/components/ui/paper-background'

export function ExclusivityCTA() {
  return (
    <PaperBackground
      gradient="both"
      className="w-full bg-ink"
      textureUrl="https://framerusercontent.com/images/kyS26IYlxhpf1ogFNR9ihcWa8Q.jpg"
    >
      <Container width="content" className="relative flex flex-col items-center gap-8 py-24 text-center">
        <p className="text-body-sm uppercase tracking-wide text-cream/80">/EXCLUSIVITY/</p>
        <h2 className="text-h2 text-cream">
          Embrace Your
          <br />
          Unfair Advantage
        </h2>
        <p className="max-w-prose text-body-lg text-cream/80">
          We only work with 3 new companies per month, to ensure we meet our quality standards
          &amp; give our customers an unfair advantage. Don&apos;t wait for a competitor to hire us!
        </p>
        <Button
          variant="outline"
          icon="arrow-right"
          href="/contact#form"
          data-on-dark="true"
        >
          CHECK AVAILABILITY
        </Button>
      </Container>
    </PaperBackground>
  )
}
