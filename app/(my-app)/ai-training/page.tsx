import type { Metadata } from 'next'
import { AiHero } from '@/components/sections/ai-hero'
import { AiNothingChanged } from '@/components/sections/ai-nothing-changed'
import { AiWorkshopOutcomes } from '@/components/sections/ai-workshop-outcomes'
import { AiPractitionerBridge } from '@/components/sections/ai-practitioner-bridge'
import { AiWorkshopFormats } from '@/components/sections/ai-workshop-formats'
import { AiWhyEpyc } from '@/components/sections/ai-why-epyc'
import { AiTrainedTeams } from '@/components/sections/ai-trained-teams'
import { AiMentors } from '@/components/sections/ai-mentors'
import { AiHowItWorks } from '@/components/sections/ai-how-it-works'
import { AiRequestWorkshop } from '@/components/sections/ai-request-workshop'
import { Voices } from '@/components/sections/voices'
import { Brands } from '@/components/sections/brands'
import { FAQs } from '@/components/sections/faqs'
import { CTAFooter } from '@/components/sections/cta-footer'
import { Button } from '@/components/ui/button'
import { aiTrainingFaqs } from '@/data/ai-training-faqs'

export const metadata: Metadata = {
  title: 'AI Workshops for Teams — Turn Your Team Into AI Builders',
  description:
    'EPYC runs hands-on AI workshops for teams that want to ship real work, not sit through a slide deck. Foundations, live building, and a working prototype by the end.',
  alternates: { canonical: '/ai-training' },
}

/* Section order mirrors the Figma "ai-training" frame (3787:47138) top to bottom. */
export default function AiTrainingPage() {
  return (
    <>
      <AiHero />
      <AiNothingChanged />
      <AiWorkshopOutcomes />
      <AiPractitionerBridge />
      <AiWorkshopFormats />
      <AiWhyEpyc />
      <Voices showProjectCta={false} />
      <AiTrainedTeams />
      <AiMentors />
      <AiHowItWorks />
      <AiRequestWorkshop />
      <Brands />
      <FAQs items={aiTrainingFaqs} />
      <CTAFooter
        eyebrow="/Get Started/"
        heading="Ready to turn your team into AI builders?"
        actions={
          <>
            <Button variant="filled" icon="arrow-right" href="#request-workshop">
              Request a Workshop
            </Button>
            <Button variant="outline" data-on-dark="true" icon="arrow-right" href="/projects">
              See the work
            </Button>
          </>
        }
      />
    </>
  )
}
