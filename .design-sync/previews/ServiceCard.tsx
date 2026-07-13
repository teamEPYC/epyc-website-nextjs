import { ServiceCard, Section } from 'epyc-website'

export default function Preview() {
  return (
    <Section tone="ink" style={{ padding: '48px 32px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 32 }}>
        <ServiceCard
          title="UI UX Design"
          body="Exceptional user experience is vital for designing great products. Be it for a website or app — we create seamless digital products for our customers."
        />
        <ServiceCard
          title="Webflow & WordPress"
          body="A website can't just be a catalog. We understand the needs of fast-paced marketing and GTM teams. 75+ organisations have trusted us."
        />
        <ServiceCard
          title="Creative Development"
          body="We work at the intersection of art, design & technology, delivering experiences that make people talk and build strategic value for brands."
        />
      </div>
    </Section>
  )
}
