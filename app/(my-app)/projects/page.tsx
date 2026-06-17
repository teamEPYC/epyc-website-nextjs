import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { fetchStrapi } from '@/lib/strapi/client'
import type { StrapiList, StrapiProject } from '@/lib/strapi/types'
import { ProjectsIndex } from '@/components/sections/projects-index'
import { CTAFooter } from '@/components/sections/cta-footer'
import { normaliseProject } from '@/lib/projects/normalise'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Selected work from EPYC — design and engineering for ambitious teams.',
  alternates: { canonical: '/projects' },
  openGraph: {
    siteName: 'EPYC',
    images: [{ url: '/og/projects.jpg', width: 2400, height: 1260, alt: 'EPYC — Projects' }],
  },
}

export const revalidate = 60

export default async function ProjectsPage() {
  const { isEnabled } = await draftMode()
  const { data } = await fetchStrapi<StrapiList<StrapiProject>>('/projects', {
    'populate[thumbnail][fields]': 'url,width,height,alternativeText,formats',
    'populate[industry][fields]': 'title,slug',
    'populate[platform][fields]': 'title,slug',
    'sort': 'featured:desc,publishedAt:desc',
    'pagination[limit]': '200',
  }, { draft: isEnabled })
  const projects = data.map((p) => normaliseProject(p))

  return (
    <>
      <ProjectsIndex projects={projects} />
      <CTAFooter />
    </>
  )
}
