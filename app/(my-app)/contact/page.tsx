import type { Metadata } from "next";
import { ComingSoon } from "@/components/sections/coming-soon";

export const metadata: Metadata = {
  title: "Contact",
  description: "Start a project with EPYC — coming soon.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <ComingSoon
      eyebrow="Contact"
      title="Let's start a project."
      body="The full contact form is on its way. Until then, drop a line at hello@epyc.in or DM us on X / LinkedIn."
    />
  );
}
