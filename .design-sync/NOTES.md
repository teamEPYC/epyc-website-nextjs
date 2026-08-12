# Design-Sync Notes — EPYC Website

This repo is a **Next.js app, not a component library**. Everything below exists
because the converter expects a published package and this repo isn't one.

## The package mirror symlink (required — build fails without it)

The converter resolves the package as `<--node-modules>/<cfg.pkg>`, which for an
app repo does not exist (`ENOENT … node_modules/epyc-website/package.json`). Fix,
once per clone (inside `node_modules/`, so it is gitignored and does not survive):

```bash
ln -s "$PWD" node_modules/epyc-website
```

It must be a symlink to the **repo root**, not a partial mirror directory: the
`cssEntry` bound check compares `realpath(cssEntry)` against `realpath(PKG_DIR)`,
so a mirror dir containing symlinked children fails with
`! cssEntry: … resolves outside the package — skipped`, silently shipping an
unstyled bundle. Recursion is not a problem in practice — the `.d.ts` glob is
scoped to a subdirectory, and `walk()` only descends `cfg.srcDir`.

There is no `dist/`, so the converter runs in **synth-entry mode** and discovers
components from `components/**`. Do NOT pass `--entry`: an explicit entry makes
`resolveDistEntry` return it, which turns off synth mode, and discovery then
falls back to the `.d.ts` export scan — which finds nothing here and degrades to
`[ZERO_MATCH] treating as tokens-only DS`.

## CSS compilation (do this before every sync)

Compile from **`.design-sync/tailwind-input.css`**, not `globals.css` directly.
That wrapper exists because Tailwind v4 only emits utilities the scanned source
actually uses, so a snapshot of the app's CSS is missing legal token utilities
(`bg-sand`, `border-bone`, `text-bone`, `border-teal-deep`). The design agent
receives a **static** stylesheet with no JIT behind it, so anything absent
renders unstyled. The wrapper's `@source inline(...)` directives force the whole
documented vocabulary in. **Keep it in sync with `conventions.md`.**

```bash
pnpm dlx @tailwindcss/cli@4 -i ./.design-sync/tailwind-input.css -o ./.design-sync/compiled-styles.css
sed -i '' "s|url('/fonts/|url('../public/fonts/|g" ./.design-sync/compiled-styles.css
```

Then two edits to the output (a script for this lives in the session history; it
is ~10 lines of Python):

1. **Insert the Google Fonts `@import` after the `@layer` statement lines near
   the top — NOT at the end of the file.** A trailing `@import` is invalid CSS:
   browsers drop any `@import` that follows style rules. The previous sync
   appended it and the notes claimed Inter / IBM Plex Serif / Fragment Mono were
   loading; they were not. Validate prints `[FONT_REMOTE]` when it is positioned
   correctly.
2. Append the `--font-*` variable definitions (next/font sets these at runtime
   via JS; there is no Next server in a preview).

```
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Serif:wght@300;400&family=Fragment+Mono&display=swap');
:root {
  --font-rationalist: 'TT Rationalist';
  --font-norms-serif: 'TT Norms Pro Serif';
  --font-inter: 'Inter';
  --font-plex-serif: 'IBM Plex Serif';
  --font-fragment-mono: 'Fragment Mono';
}
```

## The Next.js runtime shim (`.design-sync/shims/process-shim.ts`)

Wired via `cfg.extraEntries`, which the converter emits **before** the main entry
in `.bundle-entry.mjs`, so it initialises ahead of any Next module. It fixes
three failures that each blanked every card in the bundle:

| Symptom | Cause |
|---|---|
| `ReferenceError: process is not defined` | `next/link` and `next/image` read `process.env.__NEXT_*` at module scope; the converter only defines `NODE_ENV` |
| `__dirname is not defined` | ncc-packed Next modules pulled in lazily by `next/image` touch CommonJS `__dirname` |
| `hostname … is not configured` then `missing "loader" prop` | `next/image` has no config, so it falls back to defaults. The shim supplies `__NEXT_IMAGE_OPTS` with `unoptimized: true` and `loader: 'default'` — `'custom'` demands the compiler-injected loaderFile |

## Images: use `https://epyc.in/...`, never a media CDN path

All imagery is local under `public/images/**` and served by the site itself, so
production URLs work in previews (`https://epyc.in/images/projects/<hash>.png`
→ 200). **The previous sync's previews pointed at
`https://website-media.epyc.in/...`, which 404s** — every card showed a broken
image. `media.epyc.in` is only for Strapi media, and `/cdn-cgi/image/...`
transformations need the Cloudflare zone.

Take `src`/`alt` pairs verbatim from `data/*.ts` (`data/brands.ts`,
`data/projects.ts`) — guessing which logo a hashed filename is gets them wrong.

## Preview contract: NAMED exports only

Each cell is a **named PascalCase export** (`emit.mjs` enumerates
`/^[A-Z]/` keys off `window.__dsPreview`). A `export default function Preview()`
compiles fine and yields **zero cells → root empty**. All 15 previews from the
previous sync were written that way and every one of them was broken.

## Components that cannot render statically (deliberately floor cards)

- **`Reveal`** — visibility is gated on a `useInView` IntersectionObserver
  callback that lands after the screenshot, so it always captures at
  `opacity: 0`. No prop combination fixes it (`amount={0}`, tiny `duration`
  were both tried). Floor card is the honest outcome.
- **`CaseStudyShell`, `CaseStudyViewToggle`** — call `useSearchParams()`, which
  returns `null` outside a Next app-router context → `Cannot read properties of
  null (reading 'get')`. There is no provider in the DS that can supply it.
- `ShowInTldr` / `HideInTldr` DO work standalone — they read a React context
  with a default. **Do not wrap them in `CaseStudyShell` in a preview** or they
  inherit the failure above.

## Per-component gotchas found while authoring previews

- `PlusMinus` requires `open` — omit it and it renders as a plain plus.
- `StarRating`'s `showScore` defaults to **true**; pass `showScore={false}` for
  stars only. Stars never part-fill, so `score` only changes the label.
- Wordmark/glyph icons (`ClutchWordmark`, `EpycMark`, `EpycWordmark`,
  `WebflowGlyph`, `BubbleGlyph`, `FramerGlyph`) are viewBox-only with no
  intrinsic size — they collapse to nothing in a flex row without an explicit
  height. The `size`-prop icons are fine.
- `IconButton` needs both `aria-label` (required by the type) and an icon child.
- `Field` renders an `sr-only` label by design; the placeholder is the visible
  prompt. An empty-looking Field is correct.
- `Button` icons are React components (`icon="arrow-right"`), NOT image paths —
  an older note in this file claimed the default icon was a broken
  `/images/site/...` SVG. It never was.
- `DashedDivider` sets `preserveAspectRatio="none"`, so its centre motif
  squashes at narrow widths. Real behaviour, not a preview fault.

## Known render warns (all triaged — an unrecorded warn is new)

Currently **none**: the final validate exits 0 with zero warnings other than the
informational `[FONT_REMOTE]`. Card-presentation overrides in `cfg.overrides`
are what removed the `[GRID_OVERFLOW]` warns:

- `ProjectCard`, `SectionHeading`, `Testimonial` → `cardMode: "column"` (render
  wider than a grid cell)
- `FloatingMenuButton`, `ReadingProgress` → `cardMode: "single"` (both are
  `position: fixed`, so no grid layout can present them)

## Guidelines

`cfg.guidelinesGlob` is pinned to `["DESIGN.md"]`. The default glob picked up
`docs/strapi-migration-plan.md` — an internal CMS migration doc, not a design
guideline. `DESIGN.md` is the canonical token/typography reference and is
exactly what the design agent should read.

## Re-sync risks (the watch-list)

- **`node_modules/epyc-website` symlink is not committed** — recreate it on a
  fresh clone or the build dies immediately. `pnpm install` may also remove it.
- **`compiled-styles.css` goes stale** whenever `globals.css` changes, and any
  NEW token family needs adding to `tailwind-input.css`'s `@source inline(...)`
  or the agent's classes will silently no-op.
- **`conventions.md` names must stay true.** Validate class/token/component
  names against the fresh build every sync; a name that stops resolving makes
  the agent emit unstyled markup with no error.
- **Preview imagery depends on epyc.in being up** and on those hashed filenames
  surviving in `public/images/**`. A renamed asset shows a broken image in a
  card and nothing will flag it.
- **Google Fonts `@import` needs network access** at render time, and its
  position in the file is load-bearing (see above).
- **`.design-sync/previews/*.tsx` import `'epyc-website'`**, which the repo's own
  tsconfig cannot resolve — expect an editor/`tsc` error `Cannot find module
  'epyc-website'` on those files. Harmless: they are compiled only by the
  converter, which shims that specifier to the bundle global.
- **Icon grades were confirmed** from the per-component sheets for 6 icons plus a
  single all-icon montage rendered from the shipped bundle (every glyph paints
  and is distinct), rather than 18 individual full-page sheet reads. Re-check
  individually if an icon's source changes.
- 27 components remain on the **floor card** (sections mostly, plus the three
  above that cannot render). They are fully importable; authoring their previews
  is the standing incremental improvement for a later sync.
