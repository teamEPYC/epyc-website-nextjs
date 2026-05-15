import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'
import { SectionHeading } from '@/components/ui/section-heading'
import { BrandTile } from '@/components/ui/brand-tile'
import { Reveal } from '@/components/ui/reveal'
import { brands } from '@/data/brands'

export function Brands() {
  return (
    <Section tone="beige" className="py-12 ">
      <Container className="max-w-[1150px] px-0 sm:px-0 lg:px-0">
        <Reveal className="flex flex-col gap-4 lg:gap-20">
          <div className="flex px-4 lg:px-0 justify-center">
            <SectionHeading className="text-left w-full">Our Brands</SectionHeading>
          </div>
          <div className="grid w-full p-4 h-min flex-none relative overflow-hidden lg:p-0 gap-[10px] justify-center grid-cols-[repeat(3,minmax(50px,1fr))] lg:grid-cols-[repeat(4,minmax(50px,1fr))] lg:grid-rows-[repeat(2,290px)] lg:auto-rows-[290px]">
            {brands.map((b) => (
              <BrandTile key={b.id} src={b.src} alt={b.alt} />
            ))}
          </div>
        </Reveal>
      </Container>
    </Section>
  )
}
