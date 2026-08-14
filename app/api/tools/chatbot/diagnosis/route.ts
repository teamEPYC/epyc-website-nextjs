import { NextResponse } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import {
  mergeJudged,
  scoreDeterministic,
  scoreWithModel,
  type Diagnosis,
} from '@/lib/tools/chatbot/diagnosis'
import {
  getSession,
  loadPages,
  loadPagesForScoring,
  saveDiagnosis,
} from '@/lib/tools/session'

/**
 * The report for a session.
 *
 * Normally this is a read: the deterministic three were stored when the crawl
 * finished, and the model call filled in the other two in the background on
 * message one. If neither has happened, it computes the deterministic three
 * inline rather than returning an error — a partial report converts, an error
 * state does not.
 */
export async function GET(req: Request) {
  const sessionId = new URL(req.url).searchParams.get('sessionId')
  if (!sessionId) {
    return NextResponse.json({ ok: false, error: 'Missing session.' }, { status: 400 })
  }

  const { env, ctx } = getCloudflareContext()
  const db = env.DB

  const session = await getSession(db, sessionId)
  if (!session) {
    return NextResponse.json({ ok: false, error: 'That session has expired.' }, { status: 404 })
  }

  if (session.diagnosis_json) {
    try {
      let stored = JSON.parse(session.diagnosis_json) as Diagnosis

      // Repair rather than serve a broken report. A stored diagnosis can be
      // missing its measured half — sessions written before the reuse path
      // stored one, or any future write that skips it — and rendering that
      // takes the report down. Rebuild the measured three from the pages we
      // still have, keep whatever judged half exists, and write it back so the
      // repair happens once rather than on every read.
      if (!stored?.structure || !stored.crawlability || !stored.specificity) {
        const pages = await loadPagesForScoring(db, sessionId)
        stored = {
          ...scoreDeterministic(pages, {}, false),
          answerability: stored?.answerability ?? null,
          coverage: stored?.coverage ?? null,
          partial: !stored?.answerability,
        }
        await saveDiagnosis(db, sessionId, stored)
      }

      // Normally the judged half is scored in the background on message one.
      // A visitor who skips straight to the report never sends one, so nothing
      // would ever trigger it and the panel would poll forever. Asking for the
      // report is itself the signal that someone wants it, so start the call
      // here and let the client's polling pick it up.
      if (!stored.answerability && session.status === 'ready' && env.OPENROUTER_API_KEY) {
        ctx.waitUntil(
          (async () => {
            try {
              const pages = await loadPages(db, sessionId)
              const judged = await scoreWithModel(env.OPENROUTER_API_KEY!, session.host, pages, {
                allowPaid: env.OPENROUTER_ALLOW_PAID === 'true',
              })
              const scoringPages = await loadPagesForScoring(db, sessionId)
              await saveDiagnosis(db, sessionId, mergeJudged(stored, judged, scoringPages))
            } catch (err) {
              console.error('diagnosis scoring failed', err)
            }
          })(),
        )
      }

      return NextResponse.json({ ok: true, host: session.host, diagnosis: stored })
    } catch {
      // Fall through and recompute rather than failing on a bad row.
    }
  }

  // No stored diagnosis means we never saw this session's crawl, so the
  // sitemap and robots findings are unknown — `false` here omits them rather
  // than reporting an absence we cannot vouch for.
  const pages = await loadPagesForScoring(db, sessionId)
  const diagnosis = scoreDeterministic(pages, {}, false)

  return NextResponse.json({ ok: true, host: session.host, diagnosis })
}
