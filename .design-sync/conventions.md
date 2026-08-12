## How to build with the EPYC design system

A warm, single-theme marketing system: dark green `ink`, warm `beige`/`cream`
surfaces, and `crimson` carrying every call to action. **There is no dark mode
and no pure black or pure white** — never introduce either.

### Setup: no provider, but styles are mandatory

Components need **no provider, theme object, or context wrapper** — import and
render them directly. What they do need is the stylesheet: every component is
styled with Tailwind utility classes that only exist in the shipped CSS. Link
`styles.css` (it `@import`s the component CSS and the self-hosted brand fonts)
or the components render as unstyled HTML.

Two structural components own page rhythm, and nearly every screen uses them
together — `Section` for vertical padding and background tone, `Container` for
horizontal measure and responsive gutters (16/24/60px):

```tsx
<Section tone="ink">
  <Container>
    <SectionHeading tone="cream" size="h2">Built to convert</SectionHeading>
  </Container>
</Section>
```

`Section` takes `tone="beige" | "ink" | "cream"`. On `tone="ink"`, pair text
with `text-cream` (or `text-cream/80` for secondary); on light tones use
`text-ink` / `text-ink/60`.

### The styling idiom: Tailwind v4 utilities from theme tokens

Style your own layout glue with these utilities — they are generated from the
`@theme` block, so they are the system's real vocabulary. Never hardcode a hex
value.

| Family | Utilities |
|---|---|
| Colour | `ink` `crimson` `beige` `cream` `sand` `bone` `teal-deep` — as `bg-*`, `text-*`, `border-*`, with opacity like `text-ink/60`, `border-cream/25` |
| Type scale | `text-display` `text-h1` `text-h2` `text-h2-light` `text-h3` `text-h4` `text-h4-alt` `text-h5` `text-body-lg` `text-body` `text-body-sm` `text-quote` `text-code` |
| Font family | `font-display` (TT Rationalist — headings) `font-serif` (TT Norms Pro Serif — body) `font-sans` (Inter) `font-plex-serif` `font-mono` |
| Radius | `rounded-sm` (16px) `rounded-md` (24px) `rounded-lg` (28px) `rounded-xl` (43px) `rounded-pill` (100px) `rounded-full` |
| Measure | `--container-content` (1150px, the default) `--container-outer` (1440px) |

The type utilities carry family, size, tracking, and line-height together and
are responsive by construction — use `text-h2`, never `text-[31px] font-display`.

### Component notes that are easy to get wrong

- **`Button`** — `variant="filled"` (crimson) or `"outline"`; `size="md" | "lg"`;
  `icon="arrow-right" | "arrow-down"`. On a dark section an outline button needs
  `data-on-dark="true"` to flip to cream.
- **`SectionHeading`** — adds the `/ / ` slashes itself. Pass plain text.
- **`Pill`** / **`Badge`** — `tone="cream-on-dark"` on ink, `tone="ink-on-light"`
  on beige/cream. Pick the one matching the surface or the chip disappears.
- **`Reveal`** — wrap any block for the standard fade + 16px rise on scroll
  entry; it honours `prefers-reduced-motion`. It changes no layout.
- **Icons** paint with `currentColor`. The `size`-prop icons (`ArrowRight`,
  `Star`, `Plus`, `Quote`, …) take `size={24}`; the wordmarks and glyphs
  (`EpycWordmark`, `ClutchWordmark`, `WebflowGlyph`, `BubbleGlyph`, `EpycMark`,
  `FramerGlyph`) are viewBox-only and **need an explicit height** or they
  collapse. `PlusMinus` requires `open`.
- **Images** — `ProjectCard`, `BlogCard`, `Testimonial`, `BrandTile` take an
  `image`/`src` object and render through `next/image`.

### Where the truth lives

- `styles.css` and its imports — the real tokens and component CSS.
- `guidelines/DESIGN.md` — the canonical design reference: full token tables,
  the responsive type scale with exact sizes, spacing rhythm, and the reasoning
  behind each choice. Read it before inventing anything.
- `components/<group>/<Name>/<Name>.d.ts` and `<Name>.prompt.md` — the exact
  props and usage for one component.

### An idiomatic composition

```tsx
<Section tone="beige">
  <Container>
    <SectionHeading tone="ink" size="h2" eyebrow="Our Work">
      Projects that moved the needle
    </SectionHeading>
    <div className="mt-10 grid gap-6 sm:grid-cols-2">
      <ProjectCard
        href="/case-study/gokwik"
        title="GoKwik"
        tags="UI-UX, INTERACTIONS"
        image={{ src: '/images/projects/gokwik.png', alt: 'GoKwik preview', width: 1868, height: 1050 }}
      />
      <ProjectCard
        href="https://polygon.technology/"
        title="Polygon"
        tags="WEBFLOW, INTERACTIONS"
        image={{ src: '/images/projects/polygon.png', alt: 'Polygon preview', width: 1868, height: 1050 }}
      />
    </div>
    <div className="mt-12 flex items-center gap-4">
      <Button variant="filled" icon="arrow-right" href="/contact">Start a project</Button>
      <Button variant="outline" href="/projects">See all work</Button>
    </div>
  </Container>
</Section>
```
