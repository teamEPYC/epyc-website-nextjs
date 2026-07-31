# Design-Sync Notes — EPYC Website

## CSS compilation (do this before running the converter on re-sync)

Tailwind v4 CSS must be compiled before the converter runs. The output is committed at
`.design-sync/compiled-styles.css`. After compiling, apply two patches:

```bash
# 1. Compile
pnpm dlx @tailwindcss/cli@4 -i ./app/\(my-app\)/globals.css -o ./.design-sync/compiled-styles.css

# 2. Fix absolute font paths → relative (fonts are in public/fonts/, CSS lives in .design-sync/)
sed -i '' "s|url('/fonts/|url('../public/fonts/|g" ./.design-sync/compiled-styles.css

# 3. Append font CSS variable definitions + Google Fonts import (next/font sets these at runtime)
cat >> ./.design-sync/compiled-styles.css << 'FONTEOF'

/* ---- Design-sync preview font overrides --------------------------------- */
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Serif:wght@300;400&family=Fragment+Mono&display=swap');
:root {
  --font-rationalist: 'TT Rationalist';
  --font-norms-serif: 'TT Norms Pro Serif';
  --font-inter: 'Inter';
  --font-plex-serif: 'IBM Plex Serif';
  --font-fragment-mono: 'Fragment Mono';
}
FONTEOF
```

**Why**: globals.css uses Tailwind v4 `@import 'tailwindcss'` and `@theme`/`@utility` syntax that esbuild can't parse directly. CSS must be pre-compiled. Font paths in globals.css use absolute `/fonts/` URLs (Next.js public root); the converter needs relative filesystem paths. next/font sets `--font-rationalist`, `--font-norms-serif`, etc. as CSS vars at runtime via JS — the design-sync preview doesn't have Next.js running, so we hardcode them.

## Font situation

- **TT Rationalist** (display face): self-hosted in `public/fonts/`. Ships in bundle via `@font-face`. ✅
- **TT Norms Pro Serif** (body face): self-hosted in `public/fonts/`. Ships in bundle via `@font-face`. ✅
- **Inter**: Google Font, loaded via `@import url(...)` in compiled-styles.css. ✅
- **IBM Plex Serif**: Google Font, loaded via `@import url(...)`. ✅
- **Fragment Mono**: Google Font, loaded via `@import url(...)`. ✅

## Next.js imports in components

Many components import `next/link` and `next/image`. These bundle fine with esbuild since
`next` is in node_modules. `next/image` renders as a standard `<img>` tag in client context
(no server-side optimization in previews — images load directly from their `src` URLs).

CDN images from `https://website-media.epyc.in` will load in preview cards if online.
Static images from `/images/...` will show as broken images (no Next.js server).

## Components with data dependencies (sections)

Many sections (`projects-index.tsx`, `gallery-index.tsx`, `blog-index.tsx`) fetch from Strapi
at runtime and render nothing without data. Preview these with realistic mock data in authored
`.tsx` previews (`.design-sync/previews/`).

## Known render warns
(populated during verify loop)

## Re-sync risks

- `compiled-styles.css` goes stale if new Tailwind utilities are used — recompile per the CSS compilation steps above
- Components that hardcode `/images/site/...` SVG paths (like the default Button icon arrow) will show broken in previews — override `icon` prop or provide a full URL in preview
- Google Fonts `@import url(...)` requires internet connectivity during preview render
- Sections with Strapi data (`projects-index`, `gallery-index`, `blog-index`, `blog-post`, `gallery-detail`) need authored previews with mock data
