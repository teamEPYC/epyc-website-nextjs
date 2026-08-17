/**
 * The AI chatbot demo's report.
 *
 * Five dimensions. Three come from the shared site checks and cost nothing;
 * Answerability and Coverage need judgement and share a single model call. If
 * that call fails we still render the other three — a partial report converts,
 * an error state does not.
 *
 * Every number points at something. No score is emitted without the evidence
 * underneath it, because the whole pitch is "here is what your own site says".
 *
 * Everything tool-agnostic lives in ../site-checks.ts and is shared with the
 * Website Grader and the llms.txt Generator. Only the chatbot-specific half —
 * the ten buyer questions and the page types — is here.
 */

import { buyerQuestions } from '@/data/buyer-questions'
import { SCORING_CHAIN, completeJson } from '../models'
import type { StoredPage } from '../session'
import { runSiteChecks, type CrawlSignals, type SiteChecks, type SitePage } from '../site-checks'

export type { CrawlSignals, SitePage }

export type Diagnosis = SiteChecks & {
  /** Null until the model call lands. */
  answerability: {
    answered: number
    total: number
    unanswered: { id: string; question: string }[]
  } | null
  coverage: { present: string[]; missing: string[] } | null
  /** True while answerability and coverage are missing. */
  partial: boolean
  scoredAt: string
}

/** The measured three, with the judged two left null for the background call. */
export function scoreDeterministic(
  pages: SitePage[],
  signals: CrawlSignals,
  signalsKnown = true,
): Diagnosis {
  return {
    ...runSiteChecks(pages, signals, signalsKnown),
    answerability: null,
    coverage: null,
    partial: true,
    scoredAt: new Date().toISOString(),
  }
}

/**
 * Fold the judged half into a stored diagnosis, guaranteeing a complete one.
 *
 * The naive `{...existing, ...judged}` silently produces a report with an
 * answerability score and no structure or crawlability when `existing` is
 * missing or malformed — which the UI then dereferences and dies on. Rebuild
 * the measured half from the pages rather than trusting what was stored.
 */
export function mergeJudged(
  existing: Partial<Diagnosis> | null,
  judged: Pick<Diagnosis, 'answerability' | 'coverage'>,
  pages: SitePage[],
  signalsKnown = false,
): Diagnosis {
  const base =
    existing?.structure && existing.crawlability && existing.specificity
      ? (existing as Diagnosis)
      : scoreDeterministic(pages, {}, signalsKnown)

  return { ...base, ...judged, partial: false }
}

const PAGE_TYPES = [
  'what they do',
  'who they serve',
  'pricing or process',
  'proof — results, case studies or named clients',
  'contact',
] as const

type ModelVerdict = {
  questions: { id: string; answerable: boolean; evidence: string }[]
  pageTypesPresent: string[]
}

/**
 * Answerability and Coverage — the two that need judgement — in one call.
 *
 * Asking for evidence per question is not decoration: it forces the model to
 * point at the text before it claims a question is answered, which is what
 * stops a confident "yes" on a page that says nothing. It also makes a wrong
 * score debuggable rather than mysterious.
 */
export async function scoreWithModel(
  apiKey: string,
  host: string,
  pages: StoredPage[],
  opts: { allowPaid?: boolean } = {},
): Promise<Pick<Diagnosis, 'answerability' | 'coverage'>> {
  const corpus = pages
    .map((p) => `## ${p.title || 'Untitled'}\nURL: ${p.url}\n\n${p.text}`)
    .join('\n\n---\n\n')
    .slice(0, 300_000)

  const questionList = buyerQuestions
    .map((q) => `- id "${q.id}": ${q.question} (answered if the site shows: ${q.looksLike})`)
    .join('\n')

  const result = await completeJson<ModelVerdict>({
    apiKey,
    chain: SCORING_CHAIN,
    allowPaid: opts.allowPaid,
    maxTokens: 3000,
    messages: [
      {
        role: 'system',
        content: `You audit whether a company's website answers the questions a buyer asks before getting in touch. You judge ONLY from the supplied page text. You never use outside knowledge about the company. You are strict but fair: a question counts as answered when a buyer could act on what the site actually says, even if it is brief. It does not count when the site only gestures at the topic without specifics. Reply with JSON only.`,
      },
      {
        role: 'user',
        content: `Website: ${host}

For each question below, decide whether the site text answers it. Quote the exact words that answer it, or an empty string if nothing does.

Questions:
${questionList}

Also list which of these page types the site clearly has: ${PAGE_TYPES.map((t) => `"${t}"`).join(', ')}.

Reply with exactly this JSON shape and nothing else:
{"questions":[{"id":"<id>","answerable":true|false,"evidence":"<exact quote or empty string>"}],"pageTypesPresent":["<type>"]}

--- WEBSITE CONTENT ---
${corpus}`,
      },
    ],
  })

  const byId = new Map(result.questions?.map((q) => [q.id, q]) ?? [])

  // Trust the model's verdict only where it produced evidence. A claimed
  // "answerable" with nothing quoted is the failure mode this guards against.
  const unanswered = buyerQuestions
    .filter((q) => {
      const verdict = byId.get(q.id)
      return !verdict?.answerable || !verdict.evidence?.trim()
    })
    .map((q) => ({ id: q.id, question: q.question }))

  const present = (result.pageTypesPresent ?? []).filter((t) =>
    (PAGE_TYPES as readonly string[]).includes(t),
  )

  return {
    answerability: {
      answered: buyerQuestions.length - unanswered.length,
      total: buyerQuestions.length,
      unanswered,
    },
    coverage: {
      present,
      missing: PAGE_TYPES.filter((t) => !present.includes(t)),
    },
  }
}
