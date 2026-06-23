# EPYC — Design System

Extracted from the Framer source (`epyc.in`) and ported to Tailwind v4 tokens.
All tokens live in [`app/globals.css`](./app/globals.css) inside the `@theme`
block; this document is the canonical reference for *why* each token exists
and *where* to use it.

> **Where to edit values:** `app/globals.css` is the single source of truth.
> Change a token there once and every utility/component picks it up.

---

## 1. Brand colors

The palette is warm, low-saturation, and largely monochromatic on the cream
side, with **crimson** carrying the entire call-to-action weight. There is
**no dark mode**; the site is a single warm theme.

| Token / utility | Hex | Role | Typical pairing |
|---|---|---|---|
| `ink`         | `#183228` | Primary text on light surfaces; dark surface fills | with `cream` / `beige` text |
| `crimson`     | `#b91646` | All primary CTAs ("See Our Work", "Talk to Us")    | with `cream` text |
| `beige`       | `#f7efdd` | Default page background; soft text on dark         | with `ink` text |
| `cream`       | `#fff0d0` | Lightest surface; secondary text on `ink`          | with `ink` text |
| `sand`        | `#dec8a0` | Subtle borders, dividers, low-contrast outlines    | borders on `cream` |
| `bone`        | `#e3dece` | Neutral cream, alt surface                         | as alternate to `beige` |
| `teal-deep`   | `#105652` | Accent (used sparingly — icon-button fills, hero) | with `cream` text |

Use them in JSX via Tailwind utilities generated from the tokens:

```tsx
<button className="bg-crimson text-cream">Talk to us</button>
<div className="bg-ink text-cream">Dark section</div>
<p className="text-ink/60">Muted body copy</p>
```

---

## 2. Typography

### 2.1 Families

Each family is exposed as a CSS variable, set on `<html>` by
`next/font` in `app/layout.tsx`, and consumed via Tailwind's `font-*` utilities.

| Utility           | Family                | Loaded via            | Weights used | Role |
|-------------------|-----------------------|------------------------|--------------|------|
| `font-display`    | TT Rationalist Trl    | `next/font/local`     | 300, 400     | Display + section headings |
| `font-serif`      | TT Norms Pro Serif    | `next/font/local`     | 400, 700     | Body copy, captions, chips |
| `font-sans`       | Inter                 | `next/font/google`    | 400/500/600/700 + italics | UI labels, fallbacks |
| `font-plex-serif` | IBM Plex Serif        | `next/font/google`    | 300, 400     | Footer copyright, fine print |
| `font-mono`       | Fragment Mono         | `next/font/google`    | 400          | Inline code |

The TT* families are proprietary; the `.woff2` files are self-hosted from
`public/fonts/`. Replace them if licensing changes — see the
"Substitution" section at the bottom.

### 2.2 Responsive scale

All sizes are mobile-first; each utility upgrades at the `sm` (≥810px) and
`lg` (≥1200px) breakpoints. Numbers below: **mobile / tablet / desktop**.

| Utility          | Use                       | Family            | Size (px)     | Tracking | Line-height |
|------------------|---------------------------|-------------------|---------------|----------|-------------|
| `text-display`   | Hero H1                   | Rationalist Reg   | 42 / 52 / 64  | -0.04em  | 1.1 |
| `text-h1`        | Section H1                | Rationalist Reg   | 29 / 38 / 48  | -0.04em  | 1.1 |
| `text-h2-light`  | Section H2 (lighter)      | Rationalist Light | 31 / 38 / 48  | -0.04em  | 1.2 |
| `text-h2`        | Section H2                | Rationalist Reg   | 31 / 38 / 48  | -0.04em  | 1.2 |
| `text-h3`        | Subhead                   | Rationalist Reg   | 20 / 26 / 32  | -0.04em  | 1.4 |
| `text-h4`        | Card title (display)      | Norms Serif Bold  | 15 / 19 / 24  | 0        | 1.2 |
| `text-h4-alt`    | Card title (rationalist)  | Rationalist Reg   | 14 / 16 / 24  | 0        | 1.2 |
| `text-h5`        | Caption / meta            | Norms Serif       | 10 / 12 / 14  | 0        | 1.2 |
| `text-body-lg`   | Lead paragraph            | Rationalist Reg   | 16 / 16 / 20  | -0.02em  | 1.6 |
| `text-body`      | Default paragraph         | Norms Serif       | 12 / 16 / 16  | 0        | 1.6 |
| `text-body-sm`   | Small body / chip         | Norms Serif       | 12 / 10 / 12  | 0        | 1.2 |
| `text-quote`     | Blockquote                | Rationalist Reg   | 16            | 0        | 1.8 |
| `text-code`      | Inline code               | Fragment Mono     | inherit       | 0        | inherit |

Usage:

```tsx
<h1 className="text-display text-cream">Great Companies Deserve Great Websites</h1>
<h2 className="text-h2 text-ink">/ Featured Projects /</h2>
<p  className="text-body-lg text-ink/80">…</p>
<span className="text-h5 text-cream uppercase">WEBFLOW, UI-UX, INTERACTIONS</span>
```

### 2.3 Hierarchy guidance

- **Display vs h1.** Use `text-display` exactly once per page (the hero
  statement). Subsequent section openers use `text-h1` or `text-h2*`.
- **`text-h2-light` vs `text-h2`.** Light is for the *quietest* section
  labels on dark backgrounds (the Framer source uses it for `/ Voices of
  Delight /`-style markers). Regular is the workhorse.
- **Card titles.** Project cards use `text-h4` (Norms Serif Bold); blog
  cards use `text-h4-alt` (Rationalist) — pick based on whether the card is
  primarily image-led (Bold) or copy-led (Rationalist).
- **All-caps labels.** Use `text-h5 uppercase` for tech tags
  (`WEBFLOW, UI-UX`) and `text-body-sm uppercase` for chip labels.

---

## 3. Radii

| Token             | Value     | Used for |
|-------------------|-----------|----------|
| `rounded-sm`      | 16px      | Project tiles, brand-grid cards |
| `rounded-md`      | 24px      | Testimonial frame |
| `rounded-lg`      | 28px      | Compact pill buttons, outlined chips |
| `rounded-xl`      | 43px      | Big red CTA pill (the hero "Talk to Us") |
| `rounded-pill`    | 100px     | Full pills (badges, secondary CTAs) |
| `rounded-full`    | 9999px    | Avatars, the rounded icon button |

---

## 4. Breakpoints

Mobile-first. Defined in `@theme` so `sm:` and `lg:` Tailwind variants Just Work.

| Variant     | Min-width | Framer label  |
|-------------|-----------|----------------|
| *(default)* | 0         | Mobile         |
| `sm:`       | 810px     | Tablet         |
| `lg:`       | 1200px    | Desktop        |

---

## 5. Layout & spacing rhythm

| Token                    | Value          | Use |
|--------------------------|----------------|-----|
| `--container-content`    | 1150px         | Inner content max-width |
| `--container-outer`      | 1440px         | Full-bleed outer cap |
| `--gutter-mobile`        | 16px           | Page side padding, mobile |
| `--gutter-tablet`        | 24px           | Page side padding, tablet |
| `--gutter-desktop`       | 60px           | Page side padding, desktop |
| `--section-py-mobile`    | 30px           | Section vertical padding, mobile |
| `--section-py-desktop`   | 48px           | Section vertical padding, desktop |
| `--section-gap-mobile`   | 30px           | Inter-section vertical gap, mobile |
| `--section-gap-desktop`  | 80px           | Inter-section vertical gap, desktop |

Common internal gaps observed in the source: **10, 16, 20, 24, 30, 50, 60,
80, 96 px**. Stick to these for consistency.

---

## 6. Patterns reserved for Step 2

This document covers tokens. The reusable components that consume them
will be added in the next iteration:

- **Filled pill button** (`bg-crimson text-cream rounded-pill`)
- **Outline pill / badge** (1px sand border, transparent)
- **Project card** (image + title + tech-tags row)
- **Section header** (`/ Title /` marker + lede)
- **FAQ accordion row** (top-rule, plus/minus toggle)
- **Footer column** (Plex Serif, cream-on-ink)
- **Logo marquee / brand grid**

---

## 7. Animation — reserved for Step 3

The Framer source relies heavily on scroll-linked transforms (the featured-
projects horizontal rail, hero parallax, section pin-and-fade). These will
be reimplemented with `motion/react`. Cadence to preserve:

- Hover transitions: **~250 ms** ease-out (colour + 2–4 px translate).
- Reveal-on-enter: **400–600 ms** fade + 16 px rise.
- Scroll-pin durations: viewport-height-driven (use
  `useScroll` + `useTransform` rather than absolute durations).

---

## 8. Substitution notes (if fonts ever need to change)

If the TT families must be replaced:

| Drop                  | Closest Google Font           |
|-----------------------|--------------------------------|
| TT Rationalist Reg    | Instrument Sans, Funnel Display |
| TT Rationalist Light  | Instrument Sans (300)          |
| TT Norms Pro Serif    | Source Serif 4, Lora           |

Update `app/layout.tsx` (font imports) and remove the matching `@font-face`
blocks in `app/globals.css`. The semantic CSS variables
(`--font-display`, `--font-serif`) stay the same, so no component code has
to change.

---

## 9. Helpers

### `cn(...inputs)` — `lib/cn.ts`

Single helper everything imports. Combines `clsx` (conditional class joining)
with `tailwind-merge` (de-duplicates conflicting Tailwind utilities — the
later one wins). Always pipe user-supplied `className` through this so consumers
can override component defaults:

```tsx
import { cn } from "@/lib/cn";

<Button className={cn("w-full", className)} />
// cn("p-2", "p-4")  →  "p-4"   (twMerge resolves the conflict)
```

### Polymorphic link/button pattern

Every clickable that *points somewhere* must render a real anchor so that
right-click → "Open in new tab" works. The pattern, applied to `Button`,
`Badge`, `IconButton`, `ProjectCard`, `ProjectRow`:

- `href` provided → renders `<a>`. Internal (`/` or `#` prefix) → `next/link`.
  External (anything else) → raw `<a>` with `target="_blank" rel="noopener noreferrer"`
  injected by default.
- `href` omitted → renders `<button type="button">`.
- The component's TypeScript prop union enforces this — passing `onClick` without
  `href` keeps button typings; passing `href` switches to anchor typings.

### SSR-safe disclosure (`FAQItem`)

`FAQItem` uses the native `<details>`/`<summary>` HTML pair, not a React state
toggle, so:
- The component is a server component (no `"use client"` needed).
- Disclosure works without JavaScript loaded.
- `defaultOpen` maps to the native `open` attribute.

---

## 10. Components

All components live under `components/ui/` and accept a `className` prop that
flows through `cn()` so consumer overrides win when they conflict. Each entry
notes where the pattern appears in the Framer source.

### `<Button />` · `components/ui/button.tsx`

CTA pill. Polymorphic — `href` → anchor, otherwise `<button>`.

| Prop       | Type                                            | Default   | Notes                                                       |
|------------|--------------------------------------------------|-----------|--------------------------------------------------------------|
| `variant`  | `"filled"` \| `"outline"`                       | `"filled"`| Crimson fill vs cream stroke.                                |
| `size`     | `"md"` \| `"lg"`                                | `"lg"`    | `md` for compact contexts.                                   |
| `icon`     | `"arrow-down"` \| `"arrow-right"` \| `undefined`| —         | Right-end icon. Uses `ArrowDown`/`ArrowRight`.               |
| `href`     | `string`                                         | —         | Renders as anchor. Internal → `next/link`, external → `<a target=_blank>`. |
| `children` | `ReactNode`                                      | —         | Button label.                                                |

```tsx
<Button variant="filled" icon="arrow-down" href="/projects">See Our Work</Button>
<Button variant="filled" icon="arrow-right" href="/contact">Talk to Us</Button>
<Button variant="outline" href="https://example.com">External</Button>
<Button onClick={fn}>Plain button</Button>
```

Source: "See Our Work", "Talk to Us", "View All Projects", "Let's Talk".

### `<Pill />` · `components/ui/pill.tsx`

Small outlined chip, text only.

| Prop  | Type                                   | Default          |
|-------|-----------------------------------------|------------------|
| `tone`| `"cream-on-dark"` \| `"ink-on-light"`  | `"ink-on-light"` |

```tsx
<Pill tone="cream-on-dark">Project Management</Pill>
```

Source: testimonial "what they loved" chips.

### `<Badge />` · `components/ui/badge.tsx`

Outline rounded-pill, icon + text. Polymorphic.

| Prop   | Type                                   | Default          |
|--------|-----------------------------------------|------------------|
| `tone` | `"cream-on-dark"` \| `"ink-on-light"`  | `"cream-on-dark"`|
| `icon` | `ReactNode`                             | —                |
| `href` | `string`                                | —                |

```tsx
<Badge href="https://clutch.co/profile/epyc" icon={<ClutchWordmark className="h-4 w-auto" />}>
  <StarRating />
</Badge>
```

Source: hero Clutch / Bubble / Webflow / Framer badges.

### `<StarRating />` · `components/ui/star-rating.tsx`

5-star strip + optional brand logo + score text. All colour via `currentColor`.

| Prop          | Type        | Default | Notes                                          |
|---------------|-------------|---------|-------------------------------------------------|
| `score`       | `number`    | `4.9`   |                                                  |
| `outOf`       | `number`    | `5`     | Number of stars rendered.                       |
| `showScore`   | `boolean`   | `true`  | Show "4.9/5.0" text after the stars.            |
| `logo`        | `ReactNode` | —       | Slot for a brand glyph (e.g. `<ClutchWordmark />`). |
| `starClassName`| `string`   | —       | Applied to each star.                           |

```tsx
<StarRating logo={<ClutchWordmark className="h-4 w-auto" />} />
```

### `<IconButton />` · `components/ui/icon-button.tsx`

Round button. Polymorphic. Requires `aria-label`.

| Prop   | Type                              | Default | Notes                                  |
|--------|-----------------------------------|---------|-----------------------------------------|
| `tone` | `"ink"` \| `"crimson"` \| `"cream"`| `"ink"` |                                         |
| `size` | `"sm"` \| `"md"` \| `"lg"`        | `"lg"`  | `lg` = 58px, the Framer source default. |
| `href` | `string`                          | —       | Anchor when present.                    |

```tsx
<IconButton tone="ink" aria-label="Pronounce EPYC">
  <Play className="text-cream" />
</IconButton>
```

Source: footer "How to pronounce EPYC?" play button.

### `<FloatingMenuButton />` · `components/ui/floating-menu.tsx` · `"use client"`

Fixed bottom-centre menu pill. Self-contained — manages its own open/closed state.

| Prop    | Type                              | Default               |
|---------|------------------------------------|-----------------------|
| `links` | `{ label: string; href: string }[]`| Built-in 5-item set   |

Renders once per layout (typically in the root layout in Step 3). Closed state
shows just a hamburger + "Menu"; expanded shows the link list.

### `<SectionHeading />` · `components/ui/section-heading.tsx`

The `/ Title /` heading pattern. Slashes are added automatically — pass plain text.

| Prop      | Type                                       | Default |
|-----------|---------------------------------------------|---------|
| `as`      | `"h1"` … `"h4"`                            | `"h2"`  |
| `tone`    | `"ink"` \| `"cream"`                       | `"ink"` |
| `size`    | `"h1"` \| `"h2"` \| `"h2-light"` \| `"h3"` | `"h2"`  |
| `eyebrow` | `ReactNode`                                 | —       |

```tsx
<SectionHeading eyebrow="Start your project" tone="cream">
  Its Time, We Create
</SectionHeading>
```

### `<Container />` · `components/ui/container.tsx`

Horizontal max-width clamp + responsive gutters (16/24/60 px).

| Prop   | Type                                    | Default     |
|--------|------------------------------------------|-------------|
| `width`| `"content"` \| `"outer"` \| `"prose"`   | `"content"` |

### `<Section />` · `components/ui/section.tsx`

Vertical-padding rhythm + background tone.

| Prop   | Type                                                   | Default   |
|--------|---------------------------------------------------------|-----------|
| `tone` | `"beige"` \| `"ink"` \| `"cream"` \| `"transparent"`   | `"beige"` |

### `<ProjectCard />` · `components/ui/project-card.tsx`

Image + title + tag row, with a bottom hairline border. Polymorphic anchor.

| Prop    | Type                                                | Default  |
|---------|------------------------------------------------------|----------|
| `href`  | `string`                                             | —        |
| `title` | `ReactNode`                                          | —        |
| `tags`  | `string`                                             | —        |
| `image` | `{ src; alt; width; height }`                        | —        |
| `aspect`| `"wide"` \| `"tall"`                                 | `"wide"` |

Source: horizontal "Featured Projects" rail (Polygon, Plum HQ, etc.).

### `<ProjectRow />` · `components/ui/project-row.tsx` · `"use client"`

Accordion-style row that reveals a preview image on toggle.

| Prop          | Type      | Default |
|---------------|-----------|---------|
| `defaultOpen` | `boolean` | `false` |
| `href`        | `string`  | —       |
| `title`       | `string`  | —       |
| `tags`        | `string`  | —       |
| `image`       | `{ src; alt; width; height }` | — |

Source: "More Projects" rows (Blue Copa, Liberate Global, …).

### `<BrandTile />` · `components/ui/brand-tile.tsx`

Square card with a contained logo. Used inside the brand grid.

| Prop | Type   |
|------|--------|
| `src`| `string` |
| `alt`| `string` |

### `<ServiceCard />` · `components/ui/service-card.tsx`

Service description card — h3 title + body. Designed to sit in a 2×2 dark grid.

| Prop    | Type                       | Default    |
|---------|----------------------------|------------|
| `title` | `ReactNode`                | —          |
| `body`  | `ReactNode`                | —          |
| `align` | `"center"` \| `"start"`    | `"center"` |

### `<FAQItem />` · `components/ui/faq-item.tsx`

JS-optional disclosure via `<details>`/`<summary>`.

| Prop          | Type        | Default |
|---------------|-------------|---------|
| `question`    | `ReactNode` | —       |
| `defaultOpen` | `boolean`   | `false` |
| `children`    | `ReactNode` | answer  |

### `<Testimonial />` · `components/ui/testimonial.tsx`

Image + name/role + ornament line + quote + ornament line + tag pills.

| Prop       | Type                  | Default                          |
|------------|------------------------|----------------------------------|
| `name`     | `ReactNode`            | —                                |
| `role`     | `ReactNode`            | —                                |
| `quote`    | `ReactNode`            | —                                |
| `image`    | `{ src; alt }`         | —                                |
| `tags`     | `string[]`             | —                                |
| `tagsLabel`| `ReactNode`            | `"What they loved about us"`     |

### `<OrnamentDivider />` · `components/ui/ornament-divider.tsx`

The 540×14 horizontal sparkle ornament. Stroke uses `currentColor`.

### `<DashedDivider />` · `components/ui/dashed-divider.tsx`

The 1257×14 dashed footer divider. Stretches via `preserveAspectRatio="none"`.

### `<PaperBackground />` · `components/ui/paper-background.tsx`

Wraps content with the warm paper texture + optional top/bottom green fade
overlays.

| Prop        | Type                                        | Default                 |
|-------------|----------------------------------------------|-------------------------|
| `gradient`  | `"top"` \| `"bottom"` \| `"both"` \| `"none"`| `"none"`                |
| `textureUrl`| `string`                                     | Framer's paper-bg WebP  |

### `<CaseStudyShell />` · `components/ui/case-study-shell.tsx` · `"use client"`

Shell for static case study pages. Provides a Full / TL;DR toggle (URL param `?view=tldr`) via `CaseStudyViewContext`. Wrap the full content in `<CaseStudyFull>` and the condensed summary in `<CaseStudyTldr>` — only the active view renders.

```tsx
import { CaseStudyShell, CaseStudyFull, CaseStudyTldr } from '@/components/ui/case-study-shell'

<CaseStudyShell>
  <CaseStudyFull>…full case study…</CaseStudyFull>
  <CaseStudyTldr>…summary…</CaseStudyTldr>
</CaseStudyShell>
```

Reference implementation: `app/(my-app)/projects/gokwik/page.tsx`.

### `<BlogCard />` · `components/ui/blog-card.tsx`

Blog post card — hero image + title + date/read-time meta. Polymorphic anchor (internal → `next/link`, external → `<a target=_blank>`).

| Prop          | Type                                              | Notes                               |
|---------------|---------------------------------------------------|-------------------------------------|
| `href`        | `string`                                          | Required                            |
| `title`       | `ReactNode`                                       | —                                   |
| `image`       | `{ src; alt; width; height; focalX?; focalY? }`   | Supports focal-point offset         |
| `date`        | `string`                                          | Display date string                 |
| `readTime`    | `string`                                          | e.g. `"4 min read"`                 |
| `publishedAt` | `string`                                          | ISO string, used for `<time>`       |

### `<BlogProse />` · `components/ui/blog-prose.tsx`

Thin wrapper that applies the `blog-prose` CSS class (defined in `globals.css`) to richtext/MDX content. Use it around the rendered blog body — never apply raw Tailwind typography classes directly.

```tsx
<BlogProse>{renderedMdx}</BlogProse>
```

### `<DotLineDivider />` · `components/ui/dot-line-divider.tsx`

Crimson diamond-capped rule. Two variants:

| Prop      | Type                         | Default     |
|-----------|------------------------------|-------------|
| `variant` | `"single"` \| `"split"`     | `"single"`  |

`"split"` leaves a gap in the centre (for a title or ornament to sit in). Used between blog cards and as a section separator on newer pages.

### `<Form />` primitives · `components/ui/form.tsx`

Styled form field components. Always import from this file — never write raw `<input>` or `<select>` elements.

| Export       | Renders              | Notes                                          |
|--------------|----------------------|------------------------------------------------|
| `Field`      | Label wrapper        | `label` prop (screen-reader only); `error` prop |
| `Input`      | `<input>`            | Full field style + focus ring                  |
| `Textarea`   | `<textarea>`         | Same style as Input                            |
| `Select`     | `<select>`           | Same style, chevron via CSS background-image   |

```tsx
import { Field, Input, Select, Textarea } from '@/components/ui/form'

<Field label="Company name">
  <Input placeholder="Acme Inc." {...register('company')} />
</Field>
```

### `<GalleryCard />` · `components/ui/gallery-card.tsx`

Masonry card for the gallery index. Accepts a `GalleryItem` and renders image or autoplay video. Links to `/gallery/[slug]`.

| Prop   | Type          |
|--------|---------------|
| `item` | `GalleryItem` |

### `<GalleryRelatedCard />` · `components/ui/gallery-related-card.tsx`

Fixed-aspect (16:9) card for the "related items" row on a gallery detail page. Same `GalleryItem` type as `GalleryCard`.

### `<Stamp />` · `components/ui/services-stamp.tsx`

Crimson rounded pill with flanking `<Sparkle>` icons and `"OUR SERVICES"` text. Intended to be `absolute`-positioned over the centre of the 2×2 services grid. Content overridable via `children`.

### `<QuoteLink />` · `components/ui/quote-link.tsx`

Inline hyperlink styled for use inside cream-on-dark testimonial quotes. Stays `text-cream` + underline; fades on hover. Polymorphic (internal → `next/link`, external → `<a target=_blank>`).

### `<PronounceButton />` · `components/ui/pronounce-button.tsx` · `"use client"`

Self-contained play button that streams `/audio/epyc-pronunciation.mp3`. Renders as an `<IconButton>` — no props required. Used once in `<CTAFooter>`.

---

## 11. Icons

All icons live under `components/icons/` and are re-exported from
`components/icons/index.ts`. They share a single contract:

- Accept `className`, `size?: number`, and spread the rest of `SVGProps<SVGSVGElement>`.
- Fills/strokes use `currentColor` — colour is set by the **closest `text-*`
  utility on the icon or any ancestor**.
- `aria-hidden="true"` is set by default. Brand-mark icons use `role="img"` +
  `aria-label` so they announce as an image to AT.

| Icon              | Default size | Role        | Source mapping                                |
|-------------------|--------------|-------------|------------------------------------------------|
| `ArrowDown`       | 24           | Stroke icon | Hero "See Our Work" CTA                        |
| `ArrowRight`      | 24           | Stroke icon | Hero "Talk to Us" CTA, footer pronounce row    |
| `Star`            | 16           | Fill icon   | 5-star rating in Clutch badges                 |
| `Sparkle`         | 15           | Stroke icon | The 4-point sparkle ornament                   |
| `Plus`            | 24           | Stroke icon | FAQ closed state (rotates 45° when `<details open>`) |
| `Minus`           | 24           | Stroke icon | Alt FAQ open state (not used; kept for parity) |
| `ChevronRight`    | 14           | Stroke icon | "MORE" indicator in `ProjectRow`               |
| `Play`            | 18           | Fill icon   | Footer pronounce button                        |
| `Quote`           | 24           | Fill icon   | Reserved for future quote callouts             |
| `MenuLines`       | 41 (w)       | Fill icon   | Stylised "MENU" lines inside floating menu     |
| `EpycMark`        | —            | Brand fill  | Compact EPYC monogram (~33 px high)            |
| `EpycWordmark`    | —            | Brand fill  | Full EPYC logotype                              |
| `ClutchWordmark`  | —            | Brand fill  | Clutch logo in trust badges                    |
| `WebflowGlyph`    | —            | Brand fill  | Webflow icon in trust badge                    |
| `FramerGlyph`     | —            | Brand fill  | Framer Z-stack mark                            |
| `BubbleGlyph`     | —            | Brand fill  | Bubble.io mark                                  |

Usage:

```tsx
import { ArrowDown, Star, ClutchWordmark } from "@/components/icons";

<ArrowDown />                                       {/* inherits color from parent */}
<Star className="text-crimson" size={20} />         {/* explicit size + colour */}
<p className="text-cream"><ArrowDown /> reads cream</p>
<ClutchWordmark className="h-4 w-auto text-ink" /> {/* brand glyphs scale via h-*/w- */}
```

Brand glyphs don't accept `size` because their natural aspect ratio is non-square;
scale them with `h-*` / `w-*` instead.

> **Note on `EpycMark` vs `EpycWordmark`** — the two EPYC icons are not size
> variants of each other:
>
> - `EpycMark` (86×20 viewBox) = the **wings emblem**, the small bird-like
>   double-arrow motif that sits above the wordmark on the live site.
> - `EpycWordmark` (187×45 viewBox) = the **"EPYC" letterforms**, the wordmark
>   itself.
>
> The hero stacks both vertically (wings on top, wordmark below). Use them
> independently elsewhere as the surface dictates.

---

## 12. Page sections

Live homepage assembled from `components/sections/*`. Each is wrapped in a
`<Reveal>` for the on-enter fade so the page feels alive without being noisy.

| Section component                     | File                                          | Notes                                                                                          |
|----------------------------------------|------------------------------------------------|-------------------------------------------------------------------------------------------------|
| `<Hero />`                             | `components/sections/hero.tsx`                | Paper bg + EpycMark+EpycWordmark logo + Clutch row + 3 partner badges + H1 + CTAs.              |
| `<StickyImage />`                      | `components/sections/sticky-image.tsx`        | Desktop-only 100vh sticky paper image with top fade-in gradient.                                |
| `<FeaturedProjects />` (`'use client'`)| `components/sections/featured-projects.tsx`   | 400vh scroll trigger → horizontal rail. Reduced-motion fallback is a horizontal `overflow-x-auto` strip. |
| `<MoreProjects />`                     | `components/sections/more-projects.tsx`       | List of `<ProjectRow>` + "View All Projects" CTA.                                              |
| `<Services />`                         | `components/sections/services.tsx`            | 2×2 `<ServiceCard>` grid on paper-dark with the centred `<ServicesStamp>` overlay.             |
| `<Voices />`                           | `components/sections/voices.tsx`              | Rotated label (desktop) + `<Testimonial>` + Clutch read-more CTA.                              |
| `<Brands />`                           | `components/sections/brands.tsx`              | 4-col responsive `<BrandTile>` grid.                                                            |
| `<FAQs />`                             | `components/sections/faqs.tsx`                | `<FAQItem>` list over the dark paper image. SSR-friendly `<details>`.                          |
| `<CTAFooter />`                        | `components/sections/cta-footer.tsx`          | Bottom CTA + integrated footer with 3 dashed dividers + pronounce-EPYC row.                    |
| `<ComingSoon />` (helper)              | `components/sections/coming-soon.tsx`         | Shared layout used by the 6 placeholder routes (`/projects`, `/contact`, …).                   |
| `<ContactHero />`                      | `components/sections/contact-hero.tsx`        | Contact page layout — left copy + feature list + social links + embedded `<ContactForm>`.      |
| `<ContactForm />`  (`'use client'`)    | `components/sections/contact-form.tsx`        | react-hook-form + zod contact form with idle/submitting/success/error states.                  |
| `<ExclusivityCTA />`                   | `components/sections/exclusivity-cta.tsx`     | Teal-deep banner — "We only work with 3 new companies per month" urgency section.               |
| `<ProjectsIndex />` (`'use client'`)   | `components/sections/projects-index.tsx`      | Filterable grid of `<ProjectCard>` rows; filter state is local (industry dropdown).             |
| `<BlogIndex />`                        | `components/sections/blog-index.tsx`          | Blog listing — `<BlogCard>` list separated by `<DotLineDivider>`.                              |
| `<BlogPost />`                         | `components/sections/blog-post.tsx`           | Full blog post — hero image + `<BlogProse>` body + related posts row.                          |
| `<GalleryIndex />`                     | `components/sections/gallery-index.tsx`       | Masonry-style `<GalleryCard>` grid for `/gallery`.                                              |
| `<GalleryDetail />`                    | `components/sections/gallery-detail.tsx`      | Single gallery item — full image/video + `<GalleryRelatedCard>` row.                           |
| `<TestimonialSlider />` (`'use client'`)| `components/sections/testimonial-slider.tsx` | Animated slide-through of multiple `Testimonial` objects; used on `/projects` page.            |
| `<LegalPage />`                        | `components/sections/legal-page.tsx`          | Shell for `/privacy` and `/terms` — nav + display heading + prose slot.                        |

---

## 13. Data files

Every visible string and asset on the homepage is sourced from typed const
arrays under `data/*.ts`. Swap a file → swap the section. Future CMS
integration replaces one collection at a time.

| File                  | Exports                                          | Records      |
|------------------------|---------------------------------------------------|--------------|
| `data/site.ts`        | `site` (url, name, tagline, description, social, legal) | 1 object     |
| `data/projects.ts`    | `featuredProjects`, `moreProjects`              | 9 + 9 = 18   |
| `data/services.ts`    | `services`                                       | 4            |
| `data/brands.ts`      | `brands`                                         | 32           |
| `data/testimonials.ts`| `testimonials`                                   | 1 (extensible) |
| `data/faqs.ts`        | `faqs`                                           | 9            |
| `data/nav.ts`         | `footerColumns`, `menuLinks`, `pronunciationLines` | 3 lists     |

Brand-card and project images are currently referenced via Framer's CDN
(`framerusercontent.com/images/*`). `next.config.ts` whitelists that host
in `images.remotePatterns`. Swap to self-hosted by changing the `src` field
in `data/projects.ts` / `data/brands.ts`.

---

## 14. Animations (`motion/react`)

`Reveal` (`components/ui/reveal.tsx`) and `FeaturedProjects` are the only
motion consumers. Every effect honours `useReducedMotion()` — when the user
prefers reduced motion, the final state renders immediately with no tween.

### `<Reveal>`

Fade-in + 16px translate-up the first time the element crosses ~10% into the
viewport. Used to wrap each homepage section.

```tsx
import { Reveal } from "@/components/ui/reveal";

<Reveal y={16} duration={0.45}>
  <SectionContent />
</Reveal>
```

Props: `y` (translate distance, default 16), `duration` (s, default 0.45),
`delay`, `amount` (intersection threshold, default 0.1), `as` (HTML tag).

### Featured Projects horizontal rail

The Framer source uses a 400vh-tall scroll trigger containing a 100vh sticky
inner — vertical scroll progress maps linearly to horizontal translation of
the rail:

```tsx
const { scrollYProgress } = useScroll({
  target: outerRef,
  offset: ["start start", "end end"],
});
const x = useTransform(scrollYProgress, [0, 1], [0, -(railWidth - 1200)]);
```

The rail width is computed from card count × card width (780) + gaps (20)
+ left gutter (60). `1200` is the desktop viewport baseline; the rail
translates *almost* its full width over 400vh of scroll, leaving the last
card resting under the viewport's right edge when the trigger releases.

Reduced-motion fallback: a regular horizontally-scrolling strip with no pin.

---

## 15. SEO surface

| Asset                          | File                          | What it ships                                                              |
|--------------------------------|-------------------------------|-----------------------------------------------------------------------------|
| Sitemap                        | `app/sitemap.ts`             | All 8 routes (home + 6 placeholders + styleguide), priorities + lastmod.    |
| Robots                         | `app/robots.ts`              | Allow all + sitemap pointer.                                                |
| OG image                       | `app/opengraph-image.tsx`    | Static 1200×630 PNG via `next/og`'s `ImageResponse`. Used as default `og:image` site-wide. |
| Organization JSON-LD           | `app/layout.tsx`             | name, url, logo, sameAs (X / Instagram / LinkedIn / Clutch).                |
| WebSite JSON-LD                | `app/layout.tsx`             | name, url, description.                                                     |
| FAQPage JSON-LD                | `app/page.tsx`               | Schema.org `Question`/`Answer` for every entry in `data/faqs.ts`.           |

> `next/og` reminder: any element with multiple children must set
> `display: "flex"`. Plain `<span>text</span>` inside a flex parent will
> fail with *"Invalid value for CSS property 'display'. Received: 'inline-flex'"*.

