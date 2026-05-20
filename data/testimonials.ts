export type Testimonial = {
  id: string;
  name: string;
  role: string;
  image: { src: string; alt: string };
  quote: string[];
  tags: string[];
};

const FRAMER = "/images/testimonials";

export const testimonials: Testimonial[] = [
  {
    id: "leon-stern",
    name: "Leon Stern",
    role: "Director of Digital, Polygon",
    image: {
      src: `${FRAMER}/VIky596fhtCQGcuZWqm4IOau4M.webp`,
      alt: "Leon Stern, Director of Digital at Polygon",
    },
    quote: [
      "Honestly, I never worked with a better partner before. There is always someone available to help, you always deliver on time with great quality. For the last 12 months we have been working on very complex products & the experience working with EPYC Team has been excellent.",
    ],
    tags: ["Project Management", "Collaboration", "Pixel Perfect Implementation"],
  },
  {
    id: "paromita-gupta",
    name: "Paromita Gupta",
    role: "Director of Digital, Polygon",
    image: {
      src: `${FRAMER}/T36IIPfRnEKdocci3MgjjfYu0.webp`,
      alt: "Paromita Gupta, Director of Digital at Polygon",
    },
    quote: [
      "EPYC is arguably one of the most professional & dedicated no-code design studios, going above & beyond, working with you to ensure excellent results. They provide the perfect combination of collaborative & professional support. The team is creative, attentive to detail & very responsive to the needs of their clients.",
    ],
    tags: ["Project Management", "Flexibility", "Collaboration"],
  },
];
