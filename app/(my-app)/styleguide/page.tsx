import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { IconButton } from "@/components/ui/icon-button";
import { SectionHeading } from "@/components/ui/section-heading";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { ProjectCard } from "@/components/ui/project-card";
import { ProjectRow } from "@/components/ui/project-row";
import { BrandTile } from "@/components/ui/brand-tile";
import { ServiceCard } from "@/components/ui/service-card";
import { FAQItem } from "@/components/ui/faq-item";
import { Testimonial } from "@/components/ui/testimonial";
import { OrnamentDivider } from "@/components/ui/ornament-divider";
import { DashedDivider } from "@/components/ui/dashed-divider";
import { PaperBackground } from "@/components/ui/paper-background";
import { FloatingMenuButton } from "@/components/ui/floating-menu";
import { ClickButtonDemo } from "./_demos/button-demo";
import {
  ArrowDown,
  ArrowRight,
  Star,
  Sparkle,
  Plus,
  Minus,
  ChevronRight,
  Play,
  MenuLines,
  EpycMark,
  EpycWordmark,
  ClutchWordmark,
  WebflowGlyph,
  FramerGlyph,
  BubbleGlyph,
  Quote,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "Style Guide",
  description:
    "EPYC design system — tokens, components, icons. Live preview of everything in components/ui and components/icons.",
  alternates: { canonical: '/styleguide' },
  robots: { index: false, follow: false },
};

const colorTokens = [
  { name: "ink", hex: "#183228", role: "Primary text / dark surface" },
  { name: "crimson", hex: "#b91646", role: "CTA fills" },
  { name: "beige", hex: "#f7efdd", role: "Default page background" },
  { name: "cream", hex: "#fff0d0", role: "Lightest surface" },
  { name: "sand", hex: "#dec8a0", role: "Borders, dividers" },
  { name: "bone", hex: "#e3dece", role: "Alt cream surface" },
  { name: "teal-deep", hex: "#105652", role: "Accent (sparingly)" },
] as const;

const typeRows = [
  { utility: "text-display", sample: "Great Websites" },
  { utility: "text-h1", sample: "Featured Projects" },
  { utility: "text-h2-light", sample: "/ Voices of Delight /" },
  { utility: "text-h2", sample: "/ More Projects /" },
  { utility: "text-h3", sample: "UI UX Design" },
  { utility: "text-h4", sample: "Polygon" },
  { utility: "text-h4-alt", sample: "Plum HQ" },
  { utility: "text-h5", sample: "WEBFLOW, UI-UX, INTERACTIONS" },
  { utility: "text-body-lg", sample: "Honestly, I never worked with a better partner before." },
  { utility: "text-body", sample: "SaaS, AI, E-Commerce, Finance, VC, Education, HealthTech." },
  { utility: "text-body-sm", sample: "Bubble Bronze Agency · Webflow Professional Partner" },
];

const radii = [
  { label: "rounded-sm · 16", cls: "rounded-sm" },
  { label: "rounded-md · 24", cls: "rounded-md" },
  { label: "rounded-lg · 28", cls: "rounded-lg" },
  { label: "rounded-xl · 43", cls: "rounded-xl" },
  { label: "rounded-pill · 100", cls: "rounded-pill" },
  { label: "rounded-full", cls: "rounded-full" },
];

const navLinks = [
  ["colors", "Colors"],
  ["typography", "Typography"],
  ["radii", "Radii"],
  ["buttons", "Buttons"],
  ["badges", "Badges"],
  ["pills", "Pills"],
  ["stars", "Star Rating"],
  ["icon-buttons", "Icon Button"],
  ["section-headings", "Section Heading"],
  ["dividers", "Dividers"],
  ["project-card", "Project Card"],
  ["project-row", "Project Row"],
  ["brand-tile", "Brand Tile"],
  ["service-card", "Service Card"],
  ["faq-item", "FAQ Item"],
  ["testimonial", "Testimonial"],
  ["paper-background", "Paper Background"],
  ["icons", "Icons"],
  ["floating-menu", "Floating Menu"],
] as const;

const icons = [
  ["ArrowDown", ArrowDown],
  ["ArrowRight", ArrowRight],
  ["Star", Star],
  ["Sparkle", Sparkle],
  ["Plus", Plus],
  ["Minus", Minus],
  ["ChevronRight", ChevronRight],
  ["Play", Play],
  ["Quote", Quote],
] as const;

export default function StyleGuide() {
  return (
    <main className="bg-beige text-ink">
      <Section tone="beige" className="lg:py-20">
        <Container>
          <header className="mb-12 max-w-3xl">
            <p className="text-h5 uppercase text-ink/60">EPYC · Design System</p>
            <h1 className="mt-2 text-display text-ink">Style Guide</h1>
            <p className="text-body-lg mt-6 text-ink/80">
              Tokens, components, and icons that compose the EPYC website. Every example below renders the
              real component from <code className="text-code rounded bg-ink/5 px-1.5 py-0.5">components/ui</code>{" "}
              or <code className="text-code rounded bg-ink/5 px-1.5 py-0.5">components/icons</code>.
            </p>
          </header>

          <nav className="mb-16 flex flex-wrap gap-x-4 gap-y-2 border-y border-ink/10 py-4">
            {navLinks.map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className="text-body-sm uppercase text-ink/70 hover:text-ink"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Colors ------------------------------------------------------- */}
          <SectionBlock id="colors" title="Colors">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {colorTokens.map((c) => (
                <div
                  key={c.name}
                  className="rounded-sm border border-sand/60 bg-cream/30 p-4"
                >
                  <div
                    className="mb-3 h-20 rounded-sm border border-ink/10"
                    style={{ background: c.hex }}
                  />
                  <p className="text-h4-alt text-ink">{c.name}</p>
                  <p className="text-body-sm font-mono text-ink/70">{c.hex}</p>
                  <p className="text-body-sm mt-1 text-ink/60">{c.role}</p>
                </div>
              ))}
            </div>
          </SectionBlock>

          {/* Typography --------------------------------------------------- */}
          <SectionBlock id="typography" title="Typography">
            <div className="space-y-6">
              {typeRows.map((row) => (
                <div
                  key={row.utility}
                  className="grid items-baseline gap-2 border-b border-sand/60 pb-6 sm:grid-cols-[220px_1fr]"
                >
                  <code className="text-code text-ink/70">{row.utility}</code>
                  <p className={`${row.utility} text-ink`}>{row.sample}</p>
                </div>
              ))}
            </div>
          </SectionBlock>

          {/* Radii -------------------------------------------------------- */}
          <SectionBlock id="radii" title="Radii">
            <div className="flex flex-wrap items-end gap-6">
              {radii.map((r) => (
                <div key={r.label} className="flex flex-col items-center gap-2">
                  <div className={`h-20 w-20 bg-ink ${r.cls}`} />
                  <span className="text-body-sm text-ink/70">{r.label}</span>
                </div>
              ))}
            </div>
          </SectionBlock>

          {/* Buttons ------------------------------------------------------ */}
          <SectionBlock
            id="buttons"
            title="Buttons"
            description="Polymorphic — pass href to render as <a> (next/link for internal, native <a target=_blank> for external). Right-click any link button below and 'Open in new tab' will work."
          >
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="filled" icon="arrow-down" href="/projects">
                See Our Work
              </Button>
              <Button variant="filled" icon="arrow-right" href="/contact">
                Talk to Us
              </Button>
              <Button variant="filled" size="md" href="/projects">
                View All Projects
              </Button>
              <Button variant="outline" href="https://example.com">
                Outline (external)
              </Button>
              <ClickButtonDemo />
            </div>
          </SectionBlock>

          {/* Badges ------------------------------------------------------- */}
          <SectionBlock
            id="badges"
            title="Badges"
            description="The Clutch badge is linked and opens externally in a new tab; the others are static."
          >
            <div className="flex flex-wrap items-center gap-3">
              <Badge
                tone="ink-on-light"
                href="https://clutch.co/profile/epyc#reviews"
                icon={<ClutchWordmark className="h-4 w-auto text-ink" />}
              >
                <StarRating score={4.9} showScore className="text-ink" />
              </Badge>
              <Badge
                tone="ink-on-light"
                icon={<BubbleGlyph className="h-4 w-4 text-ink" />}
              >
                Bubble Bronze Agency
              </Badge>
              <Badge
                tone="ink-on-light"
                icon={<WebflowGlyph className="h-4 w-auto text-ink" />}
              >
                Webflow Professional Partners
              </Badge>
              <Badge
                tone="ink-on-light"
                icon={<FramerGlyph className="h-4 w-auto text-ink" />}
              >
                Framer Enterprise Partners
              </Badge>
            </div>
          </SectionBlock>

          {/* Pills -------------------------------------------------------- */}
          <SectionBlock id="pills" title="Pills">
            <div className="flex flex-wrap gap-2.5">
              <Pill tone="ink-on-light">Project Management</Pill>
              <Pill tone="ink-on-light">Collaboration</Pill>
              <Pill tone="ink-on-light">Pixel Perfect Implementation</Pill>
            </div>
            <div className="mt-6 rounded-md bg-ink p-6">
              <div className="flex flex-wrap gap-2.5">
                <Pill tone="cream-on-dark">Project Management</Pill>
                <Pill tone="cream-on-dark">Collaboration</Pill>
                <Pill tone="cream-on-dark">Pixel Perfect Implementation</Pill>
              </div>
            </div>
          </SectionBlock>

          {/* Stars -------------------------------------------------------- */}
          <SectionBlock id="stars" title="Star Rating">
            <div className="flex flex-col gap-4">
              <StarRating className="text-ink" />
              <StarRating
                className="text-ink"
                logo={<ClutchWordmark className="h-4 w-auto text-ink" />}
              />
              <div className="rounded-md bg-ink p-4">
                <StarRating
                  className="text-cream"
                  starClassName="text-cream"
                  logo={<ClutchWordmark className="h-4 w-auto text-cream" />}
                />
              </div>
            </div>
          </SectionBlock>

          {/* Icon button -------------------------------------------------- */}
          <SectionBlock
            id="icon-buttons"
            title="Icon Button"
            description="The icon inherits its colour from the button via currentColor — don't pass a text-* class on the child icon."
          >
            <div className="flex flex-wrap items-center gap-4">
              <IconButton tone="ink" aria-label="Play">
                <Play />
              </IconButton>
              <IconButton tone="crimson" aria-label="Next">
                <ArrowRight size={18} />
              </IconButton>
              <IconButton
                tone="cream"
                size="md"
                href="https://github.com/teamepyc"
                aria-label="GitHub (external)"
              >
                <ArrowRight size={16} />
              </IconButton>
            </div>
          </SectionBlock>

          {/* Section heading --------------------------------------------- */}
          <SectionBlock id="section-headings" title="Section Heading">
            <div className="flex flex-col gap-10">
              <SectionHeading>Featured Projects</SectionHeading>
              <SectionHeading size="h2-light" tone="ink">
                Voices of Delight
              </SectionHeading>
              <div className="rounded-md bg-ink p-8">
                <SectionHeading tone="cream" eyebrow="Start your project">
                  Its Time, We Create
                </SectionHeading>
              </div>
            </div>
          </SectionBlock>

          {/* Dividers ----------------------------------------------------- */}
          <SectionBlock id="dividers" title="Dividers">
            <div className="flex flex-col gap-8">
              <div>
                <p className="text-body-sm mb-3 text-ink/60">OrnamentDivider</p>
                <OrnamentDivider />
              </div>
              <div>
                <p className="text-body-sm mb-3 text-ink/60">DashedDivider</p>
                <DashedDivider />
              </div>
            </div>
          </SectionBlock>

          {/* Project card ------------------------------------------------- */}
          <SectionBlock id="project-card" title="Project Card">
            <div className="grid gap-10 lg:grid-cols-2">
              <ProjectCard
                href="https://polygon.technology/"
                title="Polygon"
                tags="WEBFLOW, INTERACTIONS"
                image={{
                  src: "/images/site/7Ql5MP7u1jXJ69ZQUw5e7o1tMU.png",
                  alt: "Polygon project preview",
                  width: 1868,
                  height: 1050,
                }}
              />
              <ProjectCard
                href="https://plum-ri.webflow.io/"
                title="Plum HQ"
                tags="WEBFLOW, UI-UX, INTERACTIONS"
                image={{
                  src: "/images/site/lB7xt9A0ReUM3hjaHFTp8kCY9eA.webp",
                  alt: "Plum HQ project preview",
                  width: 1788,
                  height: 992,
                }}
              />
            </div>
          </SectionBlock>

          {/* Project row -------------------------------------------------- */}
          <SectionBlock
            id="project-row"
            title="Project Row"
            description="Client-side toggle. Second row is defaultOpen."
          >
            <div>
              <ProjectRow
                href="https://www.bluecopa.com/"
                title="Blue Copa"
                tags="WEBFLOW, UI-UX, INTERACTIONS"
                image={{
                  src: "/images/site/MspG2YIWMeAzQy6ofCM09LeltI.webp",
                  alt: "Blue Copa preview",
                  width: 1794,
                  height: 1008,
                }}
              />
              <ProjectRow
                href="https://www.liberateglobal.com/"
                title="Liberate Global"
                tags="WEBFLOW, UI-UX, INTERACTIONS"
                defaultOpen
                image={{
                  src: "/images/site/DYamKaYMre6AG3FW3h7l3zU0k4.png",
                  alt: "Liberate Global preview",
                  width: 1914,
                  height: 1074,
                }}
              />
            </div>
          </SectionBlock>

          {/* Brand tile --------------------------------------------------- */}
          <SectionBlock id="brand-tile" title="Brand Tile">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <BrandTile
                src="/images/site/YU0shGm539fk6SAKf9F7GB73o0.svg"
                alt="Brand A"
              />
              <BrandTile
                src="/images/site/3Y807gIg19CCRqNIdIO62NOMum4.svg"
                alt="Brand B"
              />
              <BrandTile
                src="/images/site/br15O4ToYXz2uL5OxIoAjysrRLg.svg"
                alt="Brand C"
              />
              <BrandTile
                src="/images/site/ZVXPIhdU3BfXeITwHjFh41RjLEc.svg"
                alt="Brand D"
              />
            </div>
          </SectionBlock>

          {/* Service card ------------------------------------------------- */}
          <SectionBlock id="service-card" title="Service Card">
            <div className="rounded-md bg-ink p-2">
              <div className="grid grid-cols-1 divide-y divide-cream/20 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                <ServiceCard
                  title="UI UX Design"
                  body="Exceptional user experience is vital for designing great products. Be it for a website or app — we craft seamless digital products."
                />
                <ServiceCard
                  title="Creative Design / Development"
                  body="We work at intersection of art, design & technology, delivering amazing experiences that make people talk."
                />
              </div>
            </div>
          </SectionBlock>

          {/* FAQ ---------------------------------------------------------- */}
          <SectionBlock
            id="faq-item"
            title="FAQ Item"
            description="Server-rendered, JS-optional accordion via <details>. Try disabling JS — toggle still works."
          >
            <div className="rounded-md bg-ink p-6">
              <FAQItem question="Do you offer design services?">
                Yes — UI, UX, brand systems, and motion. We work end-to-end from research to handoff.
              </FAQItem>
              <FAQItem defaultOpen question="What kind of projects can you build?">
                Marketing sites, complex SaaS UI, internal tools, and bespoke landing pages. Webflow, Framer,
                custom React/Next when needed.
              </FAQItem>
              <FAQItem question="How much do you charge?">
                Project rates start from $X. Retainers from $Y. Pricing depends on scope and timeline.
              </FAQItem>
            </div>
          </SectionBlock>

          {/* Testimonial -------------------------------------------------- */}
          <SectionBlock id="testimonial" title="Testimonial">
            <div className="rounded-md bg-ink p-8 lg:p-12">
              <Testimonial
                name="Leon Stern"
                role="Director of Digital, Polygon"
                quote="Honestly, I never worked with a better partner before. There is always someone available to help, you always deliver on time with great quality."
                image={{
                  src: "/images/site/VIky596fhtCQGcuZWqm4IOau4M.webp",
                  alt: "Leon Stern",
                }}
                tags={["Project Management", "Collaboration", "Pixel Perfect Implementation"]}
              />
            </div>
          </SectionBlock>

          {/* Paper background -------------------------------------------- */}
          <SectionBlock id="paper-background" title="Paper Background">
            <PaperBackground
              gradient="both"
              className="rounded-md p-10 lg:p-16"
            >
              <h3 className="text-h2-light text-cream">
                Great Companies Deserve Great Websites
              </h3>
              <p className="text-body-lg mt-4 max-w-xl text-beige/90">
                Wrap any section with this for the warm paper texture + green fade overlays.
              </p>
            </PaperBackground>
          </SectionBlock>

          {/* Icons -------------------------------------------------------- */}
          <SectionBlock
            id="icons"
            title="Icons"
            description="Every icon inherits its color via currentColor — apply text-* utilities on the icon or any ancestor."
          >
            <div className="grid grid-cols-3 gap-6 sm:grid-cols-4 lg:grid-cols-6">
              {icons.map(([name, Cmp]) => (
                <div
                  key={name}
                  className="flex flex-col items-center gap-3 rounded-sm border border-sand/60 bg-cream/30 p-4"
                >
                  <Cmp className="text-ink" />
                  <code className="text-body-sm text-ink/70">{name}</code>
                </div>
              ))}
              <div className="flex flex-col items-center gap-3 rounded-sm border border-sand/60 bg-cream/30 p-4">
                <MenuLines className="text-ink" />
                <code className="text-body-sm text-ink/70">MenuLines</code>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
              <BrandSwatch name="EpycMark"><EpycMark className="h-6 w-auto text-ink" /></BrandSwatch>
              <BrandSwatch name="EpycWordmark"><EpycWordmark className="h-8 w-auto text-ink" /></BrandSwatch>
              <BrandSwatch name="ClutchWordmark"><ClutchWordmark className="h-5 w-auto text-ink" /></BrandSwatch>
              <BrandSwatch name="WebflowGlyph"><WebflowGlyph className="h-5 w-auto text-ink" /></BrandSwatch>
              <BrandSwatch name="FramerGlyph"><FramerGlyph className="h-5 w-auto text-ink" /></BrandSwatch>
              <BrandSwatch name="BubbleGlyph"><BubbleGlyph className="h-5 w-5 text-ink" /></BrandSwatch>
            </div>

            <div className="mt-8 rounded-sm border border-sand/60 bg-cream/30 p-4">
              <p className="text-body-sm text-ink/70 mb-3">Colour control via parent text colour:</p>
              <p className="flex flex-wrap items-center gap-4 text-crimson">
                <ArrowDown />
                <ArrowRight />
                <Star />
                <Plus />
                <ChevronRight size={20} />
              </p>
            </div>
          </SectionBlock>

          {/* Floating menu ----------------------------------------------- */}
          <SectionBlock
            id="floating-menu"
            title="Floating Menu Button"
            description="Stateful client component. Renders fixed-bottom-centre on every page in production. The instance below is live (scroll down)."
          >
            <p className="text-body text-ink/70">
              The actual floating menu is rendered at the bottom of this page. Click it to expand.
            </p>
          </SectionBlock>
        </Container>
      </Section>

      <FloatingMenuButton />
    </main>
  );
}

function SectionBlock({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 py-12">
      <div className="mb-8">
        <h2 className="text-h2 text-ink">{title}</h2>
        {description ? (
          <p className="text-body mt-2 max-w-3xl text-ink/70">{description}</p>
        ) : null}
      </div>
      {children}
      <div className="mt-12">
        <DashedDivider />
      </div>
    </section>
  );
}

function BrandSwatch({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-sm border border-sand/60 bg-cream/30 p-4">
      <div className="flex h-10 items-center">{children}</div>
      <code className="text-body-sm text-ink/70">{name}</code>
    </div>
  );
}
