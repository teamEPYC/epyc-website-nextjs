@AGENTS.md

# EPYC Website

Production website for **EPYC**, a premium design & development studio. Deployed on Vercel.

Marketing strategy, copy assets, and campaign briefs live in a separate repo (`epyc-marketing-ops`).

---

## Working Rules

- **Before writing any UI** → read `DESIGN.md` first. It is the canonical reference for every color token, typography utility, spacing rhythm, and component API. Do not invent classes or hardcode hex values — use the tokens.
- **Before adding a new page or component** → check `components/ui/` and `components/sections/` for existing primitives. Use `<Section>`, `<Container>`, `<SectionHeading>`, `<Button>`, `<Pill>` before writing bespoke markup.
- **Visual changes must use the closest design system value** — when asked to adjust size, colour, spacing, or typography, always map the request to the nearest token in `DESIGN.md` (e.g. a request for "~36px" → `text-h2` at 31/38/48px, not an arbitrary `text-[36px]`). If satisfying the request requires going outside the design system (no close token exists, or it would break visual consistency), **stop and ask for explicit sign-off before writing any code**.
- **Images** → all production images are served from `https://website-media.epyc.in` (Cloudflare R2). Self-hosted case study screenshots go in `public/images/`. Images are optimized natively by Vercel; Strapi bare media paths are resolved to absolute URLs via `lib/media.ts` (`toMediaUrl`) at the data layer — use it, don't hardcode the media host.
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
| `app/(my-app)/projects/` | Projects index (Strapi-driven) + static case study pages |
| `app/(my-app)/blog/` | Blog index + post pages (Strapi-driven) |
| `app/(my-app)/gallery/` | Gallery index + detail pages (Strapi-driven) |
| `components/ui/` | Primitive components — `Section`, `Container`, `Button`, `Pill`, `Badge`, `SectionHeading`, `ProjectCard`, `Reveal`, etc. |
| `components/sections/` | Full page sections — `Hero`, `FeaturedProjects`, `CTAFooter`, `Voices`, `FAQs`, etc. |
| `components/site-nav.tsx` | Global nav — adapts colour by pathname |
| `data/` | Typed const arrays for static content (projects, brands, testimonials, FAQs, nav) |
| `lib/strapi/` | Strapi CMS client (`fetchStrapi`) + TypeScript types |
| `lib/projects/` | Normalisation helpers for Strapi project data |
| `lib/cn.ts` | `cn()` helper — `clsx` + `tailwind-merge` |
| `lib/media.ts` | `toMediaUrl()` — resolves Strapi bare media paths to absolute `NEXT_PUBLIC_MEDIA_BASE_URL` URLs |
| `public/images/` | Self-hosted images (case study screenshots go here) |

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
- Static case study pages (e.g. `app/(my-app)/projects/gokwik/`) do **not** use Strapi — they are fully static, hand-authored pages.

---

## Deployment

- **Platform**: Vercel — deploys via Vercel's git integration (`next build`). No adapter or custom deploy scripts.
- **Images**: optimized natively by Vercel. Strapi media is served from `media.epyc.in` (whitelisted in `next.config.ts` `remotePatterns`); `lib/media.ts` resolves Strapi bare paths to absolute URLs at the data layer.
- **Contact form**: `app/api/contact/route.ts` persists each submission to Neon, then POSTs it directly to `CONTACT_WEBHOOK_URL` (env var; webhook failure is logged, not fatal). No queue or worker.
