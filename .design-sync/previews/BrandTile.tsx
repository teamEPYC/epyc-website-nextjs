import { BrandTile, Section } from 'epyc-website'

const CDN = 'https://website-media.epyc.in'

export default function Preview() {
  return (
    <Section tone="ink" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <BrandTile
          src={`${CDN}/images/brands/3Y807gIg19CCRqNIdIO62NOMum4.svg`}
          alt="Polygon logo"
        />
        <BrandTile
          src={`${CDN}/images/brands/Ri8uHoLFKV1w5HuSWpoz48izDIg.svg`}
          alt="Plum logo"
        />
        <BrandTile
          src={`${CDN}/images/brands/F84ZfqSSRZ1w4GDWntpeLNBe8CQ.svg`}
          alt="Matrix Partners logo"
        />
        <BrandTile
          src={`${CDN}/images/brands/RgRhTEJ1YzYkh09IZiupMAIBsLM.svg`}
          alt="Masters' Union logo"
        />
      </div>
    </Section>
  )
}
