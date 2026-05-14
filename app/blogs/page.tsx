import type { Metadata } from "next";
import { ComingSoon } from "@/components/sections/coming-soon";

export const metadata: Metadata = {
  title: "Blog",
  description: "Writing from the EPYC studio — coming soon.",
  alternates: { canonical: "/blogs" },
};

export default function BlogsPage() {
  return (
    <ComingSoon
      eyebrow="Blog"
      title="Notes from the studio."
      body="Essays on design, no-code, and shipping software fast — coming soon."
    />
  );
}
