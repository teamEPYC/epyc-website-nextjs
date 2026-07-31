import { Button } from 'epyc-website'

export default function Preview() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 32, background: '#f7efdd', alignItems: 'flex-start' }}>
      <Button variant="filled" size="md" href="#">Book a call</Button>
      <Button variant="outline" size="md" href="#">See our work</Button>
      <Button variant="filled" size="lg" href="#">Start a project</Button>
      <Button variant="outline" size="lg" href="#">View case studies</Button>
    </div>
  )
}
