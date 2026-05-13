import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EPYC · port in progress",
};

export default function Home() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-prose flex-col items-start justify-center gap-4 px-4 lg:px-15">
      <p className="text-h5 uppercase text-ink/60">EPYC · port in progress</p>
      <h1 className="text-h2 text-ink">Homepage arrives in Step 3.</h1>
      <p className="text-body-lg text-ink/80">
        While we build it, browse the design system at{" "}
        <Link className="underline" href="/styleguide">
          /styleguide
        </Link>
        .
      </p>
    </main>
  );
}
