import type { Metadata } from "next";
import { ComingSoon } from "@/components/sections/coming-soon";

export const metadata: Metadata = {
  title: "Gallery",
  description: "A visual archive of EPYC work — coming soon.",
  alternates: { canonical: "/gallery" },
};

export default function GalleryPage() {
  return (
    <ComingSoon
      eyebrow="Gallery"
      title="A visual archive."
      body="Stills, motion clips, and prototypes from the studio. Coming soon."
    />
  );
}
