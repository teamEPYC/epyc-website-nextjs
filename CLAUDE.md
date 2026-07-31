@AGENTS.md

# EPYC Website

Production website for **EPYC**, a premium design & development studio. Deployed on Cloudflare Workers via `@opennextjs/cloudflare`.

Marketing strategy, copy assets, and campaign briefs live in a separate repo (`epyc-marketing-ops`).

---

## Working Rules

- **Before writing any UI** → read `DESIGN.md` first. It is the canonical reference for every color token, typography utility, spacing rhythm, and component API. Do not invent classes or hardcode hex values — use the tokens.
- **Before writing any JSX** → you MUST run `find components/ui components/sections -name "*.tsx" | sort` and scan `DESIGN.md` §10 and §12 for relevant primitives. Creating a duplicate of an existing component is a blocking error. Permitted only if no existing component is close — in which case state that explicitly before writing.
- **Visual changes must use the closest design system value** — when asked to adjust size, colour, spacing, or typography, always map the request to the nearest token in `DESIGN.md` (e.g. a request for "~36px" → `text-h2` at 31/38/48px, not an arbitrary `text-[36px]`). If satisfying the request requires going outside the design system (no close token exists, or it would break visual consistency), **stop and ask for explicit sign-off before writing any code**.
- **Images** → all production images are served from `https://website-media.epyc.in` (Cloudflare R2). Self-hosted case study screenshots go in `public/images/`. The custom image loader is at `lib/image-loader.ts` — do not bypass it.
- **Dev server** → `pnpm dev` (runs `next dev --webpack` — Turbopack is disabled due to recurring panics on this Next.js version).
- **No invented copy or metrics** → pull proof points from the marketing repo's `assets/` and `copy/` directories.

---

## File Map

| Path | Purpose |
|------|---------|
| `DESIGN.md` | **Design system reference** — tokens, typography scale, component API, layout rhythm |
| `AGENTS.md` | Next.js version caveats — read before touching routing or API conventions |
| `app/(my-app)/` | All user-facing routes |
| `app/(my-app)/page.tsx` | Homepage — assembled from `components/sections/*` |
| `app/(my-app)/projects/` | Projects index page (Strapi-driven) |
| `app/(my-app)/case-study/` | Static, hand-authored case study pages (not Strapi) |
| `app/(my-app)/blog/` | Blog index + post pages (Strapi-driven) |
| `app/(my-app)/gallery/` | Gallery index + detail pages (Strapi-driven) |
| `app/(my-app)/contact/` | Contact page with enquiry form |
| `components/ui/` | Primitive components — `Section`, `Container`, `Button`, `Pill`, `Badge`, `SectionHeading`, `ProjectCard`, `Reveal`, etc. |
| `components/ui/case-study-shell.tsx` | Shell + TL;DR toggle for case study pages — read this before building a new case study. Reference impl: `app/(my-app)/case-study/gokwik/page.tsx` |
| `components/sections/` | Full page sections — `Hero`, `FeaturedProjects`, `CTAFooter`, `Voices`, `FAQs`, etc. |
| `components/site-nav.tsx` | Global nav — adapts colour by pathname |
| `data/` | Typed const arrays for static content (projects, brands, testimonials, FAQs, nav) |
| `lib/strapi/` | Strapi CMS client (`fetchStrapi`) + TypeScript types |
| `lib/projects/` | Normalisation helpers for Strapi project data |
| `lib/cn.ts` | `cn()` helper — `clsx` + `tailwind-merge` |
| `lib/image-loader.ts` | Custom Next.js image loader for Cloudflare CDN |
| `public/images/` | Self-hosted images (case study screenshots go here) |
| `workers/` | Cloudflare Worker for contact form webhook |
| `wrangler.jsonc` | Cloudflare Workers deployment config |
| `open-next.config.ts` | OpenNext Cloudflare adapter config |

**Static vs CMS data split for projects**: The homepage `FeaturedProjects` section is driven by `data/projects.ts` (static). The `/projects` index page is driven by Strapi. Case study pages under `app/(my-app)/case-study/` are fully static — they do not use Strapi. The `caseStudyPath` field on a Strapi project entry controls the link from the `/projects` page to the case study.

---

## Design System

→ See `DESIGN.md` for the full reference.

Key conventions:
- **Palette**: `ink` (#183228, dark green), `crimson` (#b91646, CTAs), `beige` (default page bg), `cream`, `sand`, `bone`. No dark mode; no black; no white.
- **Dark sections**: use `<Section tone="ink">` — gives dark green bg, pair text with `text-cream` / `text-cream/60` etc.
- **Layout**: `<Section>` for vertical padding rhythm, `<Container>` for max-width (1150px content) + responsive gutters (16/24/60px).
- **Section labels**: `<SectionHeading tone="cream">Title</SectionHeading>` — adds `/ /` slashes automatically.
- **Tags/chips**: `<Pill tone="cream-on-dark">` on dark, `<Pill tone="ink-on-light">` on light.
- **CTAs**: `<Button variant="filled">` (crimson) or `<Button variant="outline">`.
- **Reveal animations**: wrap sections in `<Reveal>` — fade + 16px rise on scroll-enter, respects `prefers-reduced-motion`.

---

## CMS — Strapi

Dynamic content (projects, blog posts, gallery) is fetched from Strapi via `lib/strapi/client.ts`.

- `STRAPI_URL` and `STRAPI_API_TOKEN` must be set in the environment. In dev, 401s from Strapi are expected and non-fatal — pages gracefully return empty lists and re-hydrate on first real request via ISR (`revalidate: 60`).
- Types are in `lib/strapi/types.ts`.
- Static case study pages (e.g. `app/(my-app)/case-study/gokwik/`) do **not** use Strapi — they are fully static, hand-authored pages.
- **Separate Strapi instances per environment**: staging and production each have their own Strapi. Updating content in one does not affect the other. If a CMS change needs to appear on epyc.in, it must be made against the production Strapi (`cms.epyc.in`). Required env vars differ per environment: staging uses `STRAPI_URL` / `STRAPI_API_TOKEN`; production uses `PRODUCTION_STRAPI_URL` / `PRODUCTION_STRAPI_API_TOKEN` (plus `PRODUCTION_STRAPI_PREVIEW`, `PRODUCTION_NEON_DATABASE_URL`, `PRODUCTION_NEXT_PUBLIC_MEDIA_BASE_URL`).
- **`mcp__strapi-epyc` connects to production** (`cms.epyc.in`). MCP edits go live on epyc.in, not staging.
- **Strapi updates — always read before write**: before calling any `update_*` MCP tool, call `get_*` first to fetch the full current document. Carry every field forward in the update payload, changing only the target field(s). Omitting a required field (e.g. `thumbnail`, `slug`, `type`) silently clears it on save.

---

## Agents & MCP

- **`epyc-builder`** (`.claude/agents/epyc-builder.md`) — use for all GitHub issue and PR management on this repo. Invoke it via the Agent tool whenever creating, updating, or closing issues, or managing labels/milestones. Do not create GitHub issues directly from the main context.
- **`mcp__strapi-epyc`** — MCP server for reading and writing Strapi content (projects, blogs, gallery, authors). Connects to **production** Strapi at `cms.epyc.in`. Use `list_*` / `get_*` tools to read; `update_*` + `publish_*` to write. Always read before write (see CMS section above).

---

## Deployment

- **Platform**: Cloudflare Workers via `@opennextjs/cloudflare`
- **Branch → environment**: `main` → staging (staging.epyc.in) | `production` branch → production (epyc.in)
- **CI auto-deploys** on push to either branch (`.github/workflows/deploy-staging.yml` / `deploy-production.yml`). Manual deploy: `pnpm deploy:staging` or `pnpm deploy:production`.
- Both commands run `opennextjs-cloudflare build` then `wrangler deploy`.
- The contact form runs as a separate Cloudflare Worker (`workers/contact-webhook/`).
- **CMS content changes do not require a redeploy** — pages use ISR (`revalidate: 60`) and pick up Strapi changes within 60 seconds.
