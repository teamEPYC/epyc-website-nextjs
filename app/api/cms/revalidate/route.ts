import { revalidatePath, revalidateTag } from 'next/cache'
import { isPreviewDeployment } from '@/lib/cms/config'
import { parseRevalidationEvent, pathsForEvent, tagsForEvent, verifyWebhookSignature } from '@/lib/cms/revalidation'

export async function POST(request: Request) {
  const startedAt = Date.now()
  const body = await request.text()
  const valid = await verifyWebhookSignature(body, request.headers.get('x-epyc-signature'), process.env.CMS_REVALIDATION_SECRET ?? '')
  if (!valid) return Response.json({ error: 'Invalid signature' }, { status: 401 })

  let parsed: unknown
  try {
    parsed = JSON.parse(body)
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const event = parseRevalidationEvent(parsed)
  if (!event) return Response.json({ error: 'Invalid event' }, { status: 400 })

  // Draft saves affect preview only. Publishing, unpublishing and deletion are
  // sent to both frontends by Payload and accepted by either deployment.
  if (event.action === 'draft' && !isPreviewDeployment()) {
    return Response.json({ eventId: event.eventId, revalidated: [], ignored: 'draft-on-production' })
  }

  const paths = pathsForEvent(event)
  const tags = tagsForEvent(event)
  for (const path of paths) revalidatePath(path)
  // `expire: 0` drops the entry now, so the first request after a publish gets
  // the new content. The recommended `'max'` profile is stale-while-revalidate,
  // which would serve the pre-publish version to that first visitor.
  for (const tag of tags) revalidateTag(tag, { expire: 0 })
  console.info('CMS revalidation', { eventId: event.eventId, collection: event.collection, action: event.action, paths, tags, durationMs: Date.now() - startedAt })
  return Response.json({ eventId: event.eventId, revalidated: paths, tags })
}
