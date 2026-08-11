import type { FAQ } from './faqs'

/**
 * AI-training FAQ. Questions are the six drawn in the Figma "Questions?" frame
 * (3787:47968); the design is the shared homepage `<FAQs>` section.
 *
 * Answers are intentionally empty — pending real copy. Fill them in before this
 * ships; an empty answer renders an empty disclosure panel.
 */
export const aiTrainingFaqs: FAQ[] = [
  { question: 'How long is the workshop?', answer: '' },
  { question: 'Onsite or remote?', answer: '' },
  { question: 'How big can the group be?', answer: '' },
  { question: 'Can this be customized for our industry or tools?', answer: '' },
  { question: 'What does it cost?', answer: '' },
  { question: 'What do we walk away with?', answer: '' },
]
