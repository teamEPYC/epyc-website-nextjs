import type { Metadata } from "next";
import { ComingSoon } from "@/components/sections/coming-soon";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected work from EPYC — coming soon.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return (
    <ComingSoon
      eyebrow="Projects"
      title="Our work, in one place."
      body="A dedicated case-study index is in the oven. In the meantime, scroll the homepage to see featured and additional projects."
    />
  );
}
