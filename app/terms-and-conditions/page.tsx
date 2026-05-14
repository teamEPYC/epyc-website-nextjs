import type { Metadata } from "next";
import { ComingSoon } from "@/components/sections/coming-soon";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms of using EPYC's services.",
  alternates: { canonical: "/terms-and-conditions" },
};

export default function TermsPage() {
  return (
    <ComingSoon
      eyebrow="Terms & Conditions"
      title="The legal page."
      body="Full terms are being finalised. Reach out to hello@epyc.in for engagement-specific questions in the interim."
    />
  );
}
