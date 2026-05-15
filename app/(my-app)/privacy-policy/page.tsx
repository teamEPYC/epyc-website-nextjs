import type { Metadata } from "next";
import { ComingSoon } from "@/components/sections/coming-soon";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How EPYC handles your data.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <ComingSoon
      eyebrow="Privacy Policy"
      title="The legal page."
      body="Full policy is being finalised. Reach out to hello@epyc.in for any data-handling questions in the interim."
    />
  );
}
