import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'
import { SectionHeading } from '@/components/ui/section-heading'
import { ProjectRow } from '@/components/ui/project-row'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/ui/reveal'
import { moreProjects } from '@/data/projects'

export function MoreProjects() {
  return (
    <Section tone="beige" className="lg:py-20">
      <Container width="outer">
        <Reveal as="div" className="flex flex-col gap-12">
          <SectionHeading>More Projects</SectionHeading>
          <div className="flex flex-col">
            {moreProjects.map((p) => (
              <ProjectRow key={p.id} href={p.href} title={p.name} tags={p.tags} image={p.image} />
            ))}
          </div>
          <div className="flex justify-center">
            <Button variant="filled" icon="arrow-down" href="/projects">
              View All Projects
            </Button>
          </div>
        </Reveal>
      </Container>
    </Section>
  )
}
