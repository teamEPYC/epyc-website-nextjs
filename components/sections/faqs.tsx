import Image from "next/image";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { FAQItem } from "@/components/ui/faq-item";
import { Reveal } from "@/components/ui/reveal";
import { faqs } from "@/data/faqs";

export function FAQs() {
  return (
    <section className="relative w-full overflow-hidden bg-ink px-6 py-12">
      <Image
        src="https://framerusercontent.com/images/kyS26IYlxhpf1ogFNR9ihcWa8Q.jpg"
        alt=""
        fill
        sizes="100vw"
        className="-z-10 object-cover"
      />
      <Container width="content" className="relative">
        <Reveal className="flex flex-col gap-20">
          <div className="flex justify-center">
            <SectionHeading tone="cream">Questions?</SectionHeading>
          </div>
          <div className="flex flex-col">
            {faqs.map((f) => (
              <FAQItem key={f.question} question={f.question}>
                {f.answer}
              </FAQItem>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
