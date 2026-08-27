import type { Metadata } from 'next'
import { SiteNav } from '@/components/site-nav'
import { EmbedManage } from '@/components/sections/embed-manage'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'

/**
 * The manage page for a claimed embed, reached from the signed link handed to
 * the owner when they claimed it. One button: read my site again.
 *
 * Never indexed and never linked from the site. The link itself is the
 * credential — see lib/tools/chatbot/embed.ts → manageToken.
 */
export const metadata: Metadata = {
  title: 'Refresh your assistant',
  robots: { index: false, follow: false },
}

export default async function ManageEmbedPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string; t?: string }>
}) {
  const { key = '', t = '' } = await searchParams

  return (
    <>
      <Section tone="beige" className="pb-0">
        <Container>
          <SiteNav className="self-stretch -mx-4 -mt-8 sm:-mx-6 sm:-mt-10 lg:-mx-15" />
        </Container>
      </Section>

      <EmbedManage embedKey={key} token={t} />
    </>
  )
}
