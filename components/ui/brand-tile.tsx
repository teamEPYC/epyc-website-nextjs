import Image from "next/image";
import { cn } from "@/lib/cn";

type BrandTileProps = {
  src: string;
  alt: string;
  className?: string;
};

export function BrandTile({ src, alt, className }: BrandTileProps) {
  return (
    <div
      className={cn(
        "relative aspect-square w-full overflow-hidden rounded-sm bg-cream/40",
        className,
      )}
    >
      <Image src={src} alt={alt} fill sizes="(min-width: 1200px) 290px, 33vw" className="object-contain p-4" />
    </div>
  );
}
