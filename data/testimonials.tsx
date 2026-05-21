import type { ReactNode } from 'react'

export type Testimonial = {
  id: string
  name: string
  role: string
  image: { src: string; alt: string }
  /**
   * The testimonial body. A plain string renders as-is. For rich content,
   * use a JSX fragment:
   *
   *   import { QuoteLink } from "@/components/ui/quote-link";
   *
   *   quote: (
   *     <>
   *       First line of the quote.<br />
   *       Read our{" "}
   *       <QuoteLink href="https://example.com">case study</QuoteLink>{" "}
   *       for the full story — it was a <em>genuine</em> pleasure.
   *     </>
   *   ),
   *
   * - `<br />`            — line break
   * - `<QuoteLink href>`  — link (internal `/path` or external `https://…`)
   * - `<em>` / `<strong>` / `<span className="…">` — inline styling
   */
  quote: ReactNode
  tags: string[]
}

const FRAMER = '/images/testimonials'

export const testimonials: Testimonial[] = [
  {
    id: 'leon-stern',
    name: 'Leon Stern',
    role: 'Director of Digital, Polygon',
    image: {
      src: `${FRAMER}/VIky596fhtCQGcuZWqm4IOau4M.webp`,
      alt: 'Leon Stern, Director of Digital at Polygon',
    },
    quote:
      'Honestly, I never worked with a better partner before. There is always someone available to help, you always deliver on time with great quality. For the last 12 months we have been working on very complex products & the experience working with EPYC Team has been excellent.',
    tags: ['Project Management', 'Collaboration', 'Pixel Perfect Implementation'],
  },
  {
    id: 'asis-panda',
    name: 'Asis Panda',
    role: 'Director of Design, Nova Benefits',
    image: {
      src: `${FRAMER}/xziMdc8W7hAvTPRS4XfK04o9E.avif`,
      alt: 'Asis Panda, Director of Design at Nova Benefits',
    },
    quote: (
      <p>
        We are not looking for an agency, we are looking for a team who would have as much as skin
        in the game as us.
        <br /> <br />
        EPYC delivered through and through without leaving a single stone unturned.With their help,
        we have launched{' '}
        <a
          href="https://novabenefits.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-cream underline"
        >
          novabenefits
        </a>{' '}
        and it has gone on to organically be featured in many respected and admired website design
        curations and awards.
      </p>
    ),
    tags: ['Pixel Perfect Implementation', 'Co-building Way of Work'],
  },
  {
    id: 'paromita-gupta',
    name: 'Paromita Gupta',
    role: 'Director of Digital, Polygon',
    image: {
      src: `${FRAMER}/T36IIPfRnEKdocci3MgjjfYu0.webp`,
      alt: 'Paromita Gupta, Director of Digital at Polygon',
    },
    quote: (
      <p className="prose">
        "EPYC is arguably one of the most professional & dedicated no-code design studios, going
        above & beyond, working with you to ensure excellent results.
        <br /> <br /> They provide the perfect combination of collaborative & professional support.
        The team is creative, attentive to detail & very responsive to the needs of their clients."
      </p>
    ),

    tags: ['Project Management', 'Flexibility', 'Collaboration'],
  },

  {
    id: 'jay-magdani',
    name: 'Jay Magdani',
    role: 'Entrepreneur in Residence, Scalix',
    image: {
      src: `${FRAMER}/GUU13cCRrkO0NQP2y27yxU4cDA.webp`,
      alt: 'Jay Magdani, Entrepreneur in Residence at Scalix',
    },
    quote:
      'EPYC is very empathetic to the challenges & needs of their clients. Quality before pricing as an approach is refreshing & their USP. We will continue working with them as long as possible.',
    tags: ['Pixel Perfect Implementation', 'Last Minute Support', 'Collaboration'],
  },
]
