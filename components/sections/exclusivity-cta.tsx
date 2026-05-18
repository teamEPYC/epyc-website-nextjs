import Link from 'next/link'
import { ArrowRight } from '@/components/icons/arrow-right'

export function ExclusivityCTA() {
  return (
    <section className="flex w-full items-center justify-center bg-teal-deep py-20">
      <div className="flex flex-col items-center gap-14 px-4">
        <div className="flex w-full max-w-[401px] flex-col items-center gap-6 text-center">
          <p className="text-body uppercase text-cream">/EXCLUSIVITY/</p>
          <h2 className="text-h2-light text-cream">
            Embrace Your
            <br />
            Unfair Advantage
          </h2>
          <p className="text-body-sm text-cream">
            We only work with 3 new companies per month, to ensure we meet our quality standards
            &amp; give our customers an unfair advantage. Don&apos;t wait for a competitor to hire us!
          </p>
        </div>

        <Link
          href="/contact#form"
          className="flex h-[67px] w-[326px] items-center justify-center gap-3 rounded-[40px] bg-cream px-10 text-body uppercase text-ink transition-colors hover:bg-cream/90 sm:h-[80px] sm:w-[338px]"
        >
          <span>CHECK AVAILABILITY</span>
          <ArrowRight size={14} className="shrink-0" />
        </Link>
      </div>
    </section>
  )
}
