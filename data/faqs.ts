export type FAQ = {
  question: string;
  answer: string;
};

export const faqs: FAQ[] = [
  {
    question: "Do you offer design services?",
    answer:
      "Yes — UI, UX, brand systems, and motion. We can work end-to-end from research and information architecture through visual design, prototyping, and developer handoff.",
  },
  {
    question: "What kind of projects can you build?",
    answer:
      "Marketing sites, complex SaaS UI, internal tools, mobile-responsive web apps, and bespoke landing pages. We pick the right stack — Webflow, WordPress, Framer, Bubble, or custom React/Next.js — based on what the project actually needs.",
  },
  {
    question: "How much do you charge?",
    answer:
      "Project pricing depends on scope, complexity, and timeline. Most marketing-site builds start in the low five figures; retainers are available for ongoing design + engineering support. Reach out and we'll send a tailored estimate.",
  },
  {
    question: "Do you work for Enterprise companies?",
    answer:
      "Yes — we've shipped websites and product UI for Polygon, Accel, upGrad, GoKwik, and many other enterprise teams. We're set up for procurement, legal, and security reviews.",
  },
  {
    question: "If the result is the same, why build No-code/Low-Code?",
    answer:
      "Speed and maintainability. No-code/low-code stacks like Webflow and Framer let marketing teams ship and iterate without an engineer in the loop. The result is comparable; the speed-to-launch and ongoing edit cost are dramatically lower.",
  },
  {
    question: "How do you work?",
    answer:
      "Discovery → strategy → design → build → launch → iterate. Every project gets a dedicated PM, a shared Slack/Linear/Notion workspace, weekly syncs, and a Figma file you'll own at the end.",
  },
  {
    question: "What all No-Code/Low-code tools you work on? (Webflow, Wordpress, Bubble, Zapier, etc)",
    answer:
      "Webflow, Framer, Bubble.io, FlutterFlow, WordPress, Zapier, Make, Airtable, and Notion. For glue + backend we'll also use Supabase, Xano, or a custom Node/Next service when the project needs it.",
  },
  {
    question: "How quickly can I get something done?",
    answer:
      "A landing page: ~1 week. A full marketing site: 3–6 weeks. A no-code product: 6–12 weeks depending on scope. We start fast with a kickoff sprint so you see real progress in the first 5 days.",
  },
  {
    question: 'What does "No-Code/Low-Code" mean?',
    answer:
      "Building production software with visual tools (Webflow, Bubble, Framer, etc.) instead of writing every line by hand. You still get hosting, CMS, integrations, and animations — just shipped faster, and editable by the team that owns the product.",
  },
];
