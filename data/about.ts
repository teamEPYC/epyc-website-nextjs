export type AboutPrinciple = {
  title: string
  body: string
}

export type AboutMilestone = {
  value: string
  label: string
  body: string
}

export const aboutMilestones: AboutMilestone[] = [
  {
    value: '75+',
    label: 'organisations shipped for',
    body: 'From venture-backed startups to public brands, teams trust EPYC with the surfaces their customers see first.',
  },
  {
    value: '3',
    label: 'new clients at a time',
    body: 'We keep the studio intentionally small so senior attention stays on strategy, craft, and launch quality.',
  },
  {
    value: '10×',
    label: 'faster no-code builds',
    body: 'When Webflow, Framer, Bubble, WordPress, or FlutterFlow is the right fit, we use it to compress the path from idea to live product.',
  },
]

export const aboutPrinciples: AboutPrinciple[] = [
  {
    title: 'Strategy before screens',
    body: 'Every engagement starts with the job the site or product has to do: win trust, explain the offer, shorten sales cycles, or help a team operate faster.',
  },
  {
    title: 'Craft that can ship',
    body: 'We care about motion, hierarchy, copy, responsiveness, CMS structure, and handoff in the same breath — because launch quality is the sum of all of it.',
  },
  {
    title: 'Stacks chosen for momentum',
    body: 'No-code and low-code are not shortcuts here. They are how marketing and product teams keep control of what they need to change after launch.',
  },
  {
    title: 'Senior attention by design',
    body: 'Taking on fewer new clients gives each project tighter feedback loops, clearer ownership, and the calm needed for high-detail execution.',
  },
]

export const aboutClients = ['Polygon', 'Accel', 'Antler', '3One4 Capital', 'upGrad', 'GoKwik']

export const aboutCapabilities = [
  'Websites',
  'Product UI',
  'No-code apps',
  'CMS systems',
  'Brand systems',
  'Launch support',
]
