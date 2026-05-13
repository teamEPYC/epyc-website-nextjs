import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Pill } from "@/components/ui/pill";
import { OrnamentDivider } from "@/components/ui/ornament-divider";

type TestimonialProps = {
  name: ReactNode;
  role: ReactNode;
  quote: ReactNode;
  image: { src: string; alt: string };
  tagsLabel?: ReactNode;
  tags?: string[];
  className?: string;
};

export function Testimonial({
  name,
  role,
  quote,
  image,
  tagsLabel = "What they loved about us",
  tags,
  className,
}: TestimonialProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-12 lg:flex-row lg:items-stretch lg:gap-10",
        className,
      )}
    >
      <div className="relative aspect-square w-full max-w-[360px] shrink-0 overflow-hidden rounded-md bg-cream/10 lg:w-[360px]">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="360px"
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col justify-center gap-8">
        <div className="flex flex-col gap-2">
          <h3 className="text-h2 text-cream">{name}</h3>
          <p className="text-body text-cream/80">{role}</p>
        </div>

        <OrnamentDivider className="text-sand/60" />

        <blockquote className="text-body-lg text-cream/90">{quote}</blockquote>

        <OrnamentDivider className="rotate-180 text-sand/60" />

        {tags && tags.length > 0 ? (
          <div className="flex flex-col gap-4">
            <p className="text-body text-cream/80">{tagsLabel}</p>
            <div className="flex flex-wrap gap-2.5">
              {tags.map((t) => (
                <Pill key={t} tone="cream-on-dark">
                  {t}
                </Pill>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
