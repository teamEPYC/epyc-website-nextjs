import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { BrandTile } from "@/components/ui/brand-tile";
import { Reveal } from "@/components/ui/reveal";
import { brands } from "@/data/brands";

export function Brands() {
  return (
    <Section tone="beige" className="py-12">
      <Container width="content">
        <Reveal className="flex flex-col gap-20">
          <div className="flex justify-center">
            <SectionHeading>Our Brands</SectionHeading>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {brands.map((b) => (
              <BrandTile key={b.id} src={b.src} alt={b.alt} />
            ))}
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
