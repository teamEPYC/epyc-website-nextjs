/**
 * The 10 questions a real buyer asks before they get in touch.
 *
 * These drive the Answerability score — the headline number on the report —
 * and 4 of them render as clickable prompts in the chat composer, so the final
 * score reads as a recap of failures the visitor already watched rather than a
 * claim they have to accept.
 *
 * Deliberately a flat, editable list: change the wording here and both the
 * score and the prompt chips follow. Keep them buyer-voiced ("what does it
 * cost"), never company-voiced ("pricing page exists"), and keep them
 * stage-agnostic — they are asked of a two-person studio and a listed company
 * alike.
 *
 * DRAFT — needs sign-off before the report ships (see docs/ai-chatbot-plan.md,
 * "Decisions needed" #2).
 */

export type BuyerQuestion = {
  /** Stable key. Never renumber — the score history is keyed on it. */
  id: string
  /** Asked of the bot verbatim, in the buyer's voice. */
  question: string
  /** Shown on the report next to a failed question, to explain the miss. */
  looksLike: string
  /** The 4 marked true become the composer's suggested prompts. */
  suggested?: boolean
}

export const buyerQuestions: readonly BuyerQuestion[] = [
  {
    id: 'what-you-do',
    question: 'What exactly does this company do?',
    looksLike: 'A plain description of the service, not a slogan.',
    suggested: true,
  },
  {
    id: 'who-for',
    question: 'Who is it for — what kind of company or customer?',
    looksLike: 'A named audience, industry, or company size.',
    suggested: true,
  },
  {
    id: 'what-it-costs',
    question: 'What does it cost, or how is pricing decided?',
    looksLike: 'A number, a range, a starting price, or an explained model.',
    suggested: true,
  },
  {
    id: 'how-long',
    question: 'How long does a typical project take?',
    looksLike: 'A timeline in weeks or months, even an approximate one.',
  },
  {
    id: 'the-process',
    question: 'What happens between first contact and finished work?',
    looksLike: 'Named stages, or a described way of working.',
  },
  {
    id: 'who-worked-with',
    question: 'Who have they worked with before?',
    looksLike: 'Named clients, logos with context, or case studies.',
    suggested: true,
  },
  {
    id: 'what-results',
    question: 'What results have they actually produced?',
    looksLike: 'Outcomes with numbers attached, not adjectives.',
  },
  {
    id: 'why-them',
    question: 'What makes them different from the alternatives?',
    looksLike: 'A specific claim a competitor could not copy verbatim.',
  },
  {
    id: 'who-does-work',
    question: 'Who actually does the work?',
    looksLike: 'Team size, names, or experience — proof of a real team.',
  },
  {
    id: 'how-to-start',
    question: 'How do I get in touch, and what happens next?',
    looksLike: 'A contact route and a stated next step.',
  },
] as const

/** The 4 that seed the composer. Kept as a derivation so the list stays single-source. */
export const suggestedQuestions = buyerQuestions.filter((q) => q.suggested)
