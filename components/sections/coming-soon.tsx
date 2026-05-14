import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";

type ComingSoonProps = {
  eyebrow: string;
  title: string;
  body: string;
};

export function ComingSoon({ eyebrow, title, body }: ComingSoonProps) {
  return (
    <Section tone="beige" className="flex min-h-[80vh] items-center lg:py-20">
      <Container width="prose">
        <div className="flex flex-col gap-6">
          <p className="text-h5 uppercase text-ink/60">{eyebrow}</p>
          <h1 className="text-h1 text-ink">{title}</h1>
          <p className="text-body-lg text-ink/80">{body}</p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Button variant="filled" icon="arrow-right" href="/">
              Back to homepage
            </Button>
            <Button variant="outline" href="/contact">
              Talk to us
            </Button>
          </div>
          <p className="text-body text-ink/60 pt-2">
            Or browse the design system at{" "}
            <Link href="/styleguide" className="underline">
              /styleguide
            </Link>
            .
          </p>
        </div>
      </Container>
    </Section>
  );
}
