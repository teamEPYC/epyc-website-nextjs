import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { ProjectsIndex } from '@/components/sections/projects-index'
import { CTAFooter } from '@/components/sections/cta-footer'
import { normaliseProject, type PayloadProject } from '@/lib/projects/normalise'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Selected work from EPYC — design and engineering for ambitious teams.',
  alternates: { canonical: '/projects' },
  openGraph: {
    siteName: 'EPYC',
    images: [{ url: '/og/projects.webp', width: 2400, height: 1260, alt: 'EPYC — Projects' }],
  },
}

// Hooks revalidate on demand when a project is edited; this fallback covers
// the rare case where direct DB writes bypass the admin.
export const revalidate = 60

// Skip build-time prerendering: the D1 binding only exists inside the
// Worker runtime, so querying Payload from the CI build environment
// would fail. The Worker renders per request; OpenNext's incremental
// cache + `revalidate = 60` still gives ISR-style caching at the edge.
export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'projects',
    depth: 1,
    sort: ['-featured', '-createdAt'],
    limit: 200,
  })
  const projects = (docs as unknown as PayloadProject[]).map((p) => normaliseProject(p))

  return (
    <>
      <ProjectsIndex projects={projects} />
      <CTAFooter />
    </>
  )
}
