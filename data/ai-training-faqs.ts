import type { FAQ } from './faqs'

/**
 * AI-training FAQ. Questions are the six drawn in the Figma "Questions?" frame
 * (3787:47968); the design is the shared homepage `<FAQs>` section.
 *
 * Answers come from copy/service-pages/ai-training-copy.md (section 11) in the
 * epyc-marketing-ops repo. Keep the two in sync.
 */
export const aiTrainingFaqs: FAQ[] = [
  {
    question: 'How long is the workshop?',
    answer: 'One to two days, depending on scope.',
  },
  {
    question: 'Onsite or remote?',
    answer: "Both. We'll figure out what works for your team.",
  },
  {
    question: 'How big can the group be?',
    answer:
      "There's no hard cap. We scale facilitators to the group so everyone still builds something, and we scope the right size with you before the workshop.",
  },
  {
    question: 'Can this be customized for our industry or tools?',
    answer:
      "Yes. Every workshop is scoped to your team's actual work, not a fixed curriculum.",
  },
  {
    question: 'What does it cost?',
    answer:
      "Pricing depends on team size and scope. Request a workshop and we'll quote it.",
  },
  {
    question: 'What do we walk away with?',
    answer: 'A working prototype your team built. Not a slide deck.',
  },
]
