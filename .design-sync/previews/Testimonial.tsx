import { Testimonial, Section } from 'epyc-website'

const CDN = 'https://website-media.epyc.in'

export default function Preview() {
  return (
    <Section tone="ink" style={{ padding: '48px 32px' }}>
      <div style={{ maxWidth: 680, position: 'relative' }}>
        <Testimonial
          name="Leon Stern"
          role="Director of Digital, Polygon"
          quote="Honestly, I never worked with a better partner before. There is always someone available to help, you always deliver on time with great quality. The experience working with EPYC Team has been excellent."
          image={{
            src: `${CDN}/images/testimonials/VIky596fhtCQGcuZWqm4IOau4M.webp`,
            alt: 'Leon Stern, Director of Digital at Polygon',
          }}
          tagsLabel="Highlights"
          tags={['Project Management', 'Collaboration', 'Pixel Perfect Implementation']}
        />
      </div>
    </Section>
  )
}
