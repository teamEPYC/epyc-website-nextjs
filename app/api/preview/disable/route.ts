import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

// GET /api/preview/disable — exit Draft Mode and return to the published site.
export async function GET() {
  const draft = await draftMode()
  draft.disable()
  redirect('/')
}
