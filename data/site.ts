// Per-environment site origin. `NEXT_PUBLIC_DEPLOY_ENV` is set by the deploy:*
// scripts and inlined by Next.js at build time, so the origin is frozen into the
// bundle for static AND dynamically-rendered pages. Unset (local `pnpm dev`)
// falls back to development. Add a new environment by adding one entry here.
const ORIGINS = {
  production: "https://epyc.in",
  staging: "https://website-staging.epyc.in",
  development: "http://localhost:3000",
} as const;

type DeployEnv = keyof typeof ORIGINS;
const deployEnv = (process.env.NEXT_PUBLIC_DEPLOY_ENV ?? "development") as DeployEnv;

export const site = {
  url: ORIGINS[deployEnv] ?? ORIGINS.development,
  name: "EPYC",
  tagline: "Website Development | Design Studio",
  description:
    "EPYC is a full-service creative studio bringing human-centric digital experiences to life, without Code. We build products that touch millions of lives, everyday.",
  social: {
    x: "https://x.com/teamepyc",
    instagram: "https://instagram.com/teamepyc",
    linkedin: "https://www.linkedin.com/company/epyc/",
    clutchProfile: "https://clutch.co/profile/epyc#reviews",
  },
  legal: {
    entity: "EPYC THOUGHTWORKS PRIVATE LIMITED",
    year: 2026,
  },
} as const;
