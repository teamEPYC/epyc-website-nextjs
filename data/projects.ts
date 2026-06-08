export type Project = {
  id: string;
  name: string;
  tags: string;
  href: string;
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
};

const FRAMER = "/images/projects";

export const featuredProjects: Project[] = [
  {
    id: "polygon",
    name: "Polygon",
    tags: "WEBFLOW, INTERACTIONS",
    href: "https://polygon.technology/",
    image: { src: `${FRAMER}/7Ql5MP7u1jXJ69ZQUw5e7o1tMU.png`, alt: "Polygon project preview", width: 1868, height: 1050 },
  },
  {
    id: "plum-hq",
    name: "Plum HQ",
    tags: "WEBFLOW, UI-UX, INTERACTIONS",
    href: "https://plum-ri.webflow.io/",
    image: { src: `${FRAMER}/lB7xt9A0ReUM3hjaHFTp8kCY9eA.webp`, alt: "Plum HQ project preview", width: 1788, height: 992 },
  },
  {
    id: "kaviraj-securities",
    name: "Kaviraj Securities",
    tags: "WEBFLOW, UI-UX, INTERACTIONS, BRANDING",
    href: "https://kavirajsecuritiesv2.webflow.io/",
    image: { src: `${FRAMER}/Lnce8dRFGCJbRIUka44Js4THZA4.png`, alt: "Kaviraj Securities project preview", width: 1912, height: 1072 },
  },
  {
    id: "seedtoscale",
    name: "SeedtoScale by Accel",
    tags: "BRANDING, UI-UX, DEVELOPMENT",
    href: "https://seedtoscale.com",
    image: { src: `${FRAMER}/WSPZhnVqH1vfozTi19TffL1lMU.webp`, alt: "SeedtoScale by Accel preview", width: 1763, height: 986 },
  },
  {
    id: "accel-atoms",
    name: "Accel Atoms",
    tags: "WEBFLOW, INTERACTIONS",
    href: "https://atoms.accel.com",
    image: { src: `${FRAMER}/KyeKdd4Pw9aeisVPB7EKpsKRNfA.png`, alt: "Accel Atoms preview", width: 1914, height: 1074 },
  },
  {
    id: "gokwik",
    name: "GoKwik",
    tags: "UI-UX, INTERACTIONS",
    href: "https://gokwik.co",
    image: { src: `${FRAMER}/vGpo90ka2h6cKMdKF4OMwjSVM.png`, alt: "GoKwik preview", width: 1868, height: 1050 },
  },
  {
    id: "upgrad-enterprise",
    name: "upGrad Enterprise",
    tags: "WEBFLOW, UI-UX, INTERACTIONS",
    href: "https://www.upgrad-enterprise.com/",
    image: { src: `${FRAMER}/kC4LOoSu2KXiAfUzsphec6gq1Ng.webp`, alt: "upGrad Enterprise preview", width: 1856, height: 1048 },
  },
  {
    id: "factors-design",
    name: "Factors Design",
    tags: "WEBFLOW, UI-UX, INTERACTIONS",
    href: "https://www.factors.design/",
    image: { src: `${FRAMER}/NMWFWEYsktnLjSgRrWYGxQTPjA.jpg`, alt: "Factors Design preview", width: 1720, height: 964 },
  },
  {
    id: "antler-theory-of-next",
    name: "Antler — Theory of Next",
    tags: "WEBFLOW, UI-UX, INTERACTIONS",
    href: "https://www.theoryofnext.com/",
    image: { src: `${FRAMER}/h6pkJDNiTDQbGQMGhMzeFlPFrDg.webp`, alt: "Antler — Theory of Next preview", width: 1790, height: 998 },
  },
];

export const moreProjects: Project[] = [
  {
    id: "blue-copa",
    name: "Blue Copa",
    tags: "WEBFLOW, UI-UX, INTERACTIONS",
    href: "https://www.bluecopa.com/",
    image: { src: `${FRAMER}/MspG2YIWMeAzQy6ofCM09LeltI.webp`, alt: "Blue Copa preview", width: 1794, height: 1008 },
  },
  {
    id: "liberate-global",
    name: "Liberate Global",
    tags: "WEBFLOW, UI-UX, INTERACTIONS",
    href: "https://www.liberateglobal.com/",
    image: { src: `${FRAMER}/DYamKaYMre6AG3FW3h7l3zU0k4.png`, alt: "Liberate Global preview", width: 1914, height: 1074 },
  },
  {
    id: "who-tm-summit",
    name: "WHO — TM Summit",
    tags: "WORDPRESS",
    href: "https://tm-summit.org/",
    image: { src: `${FRAMER}/DrholzUbCeKzcDVtSwEFLN1HxE.png`, alt: "WHO TM Summit preview", width: 1908, height: 1076 },
  },
  {
    id: "tetr",
    name: "Tetr",
    tags: "WEBFLOW, UI-UX, BRANDING, INTERACTIONS",
    href: "https://tetr.com/",
    image: { src: `${FRAMER}/zqfmjPJUvD24NruhrWaIDYPBf1k.webp`, alt: "Tetr preview", width: 1774, height: 996 },
  },
  {
    id: "anandi-school",
    name: "Anandi School",
    tags: "FRAMER, UI-UX, INTERACTIONS",
    href: "https://anandi.org/",
    image: { src: `${FRAMER}/N09IzQy1QLUzyPitkLxKA7kl2Ng.webp`, alt: "Anandi School preview", width: 1868, height: 1050 },
  },
  {
    id: "the-product-folks",
    name: "The Product Folks",
    tags: "WEBFLOW, UI-UX, INTERACTIONS",
    href: "https://theproductfolks.com/",
    image: { src: `${FRAMER}/AF17GtwWswCOeFPE1RtSIb0ZVVA.png`, alt: "The Product Folks preview", width: 1914, height: 1074 },
  },
  {
    id: "idta",
    name: "IDTA",
    tags: "WEBFLOW, UI-UX, INTERACTIONS",
    href: "https://idtalliance.org/",
    image: { src: `${FRAMER}/nQIwtdyTO0ImUbZNhFwIvZ37M.png`, alt: "IDTA preview", width: 1914, height: 1074 },
  },
  {
    id: "healthquad",
    name: "Healthquad",
    tags: "FRAMER, UI-UX, INTERACTIONS",
    href: "https://www.healthquad.com/",
    image: { src: `${FRAMER}/YWsOCrE2zQ26hEqXM3mlxNoU.png`, alt: "Healthquad preview", width: 1916, height: 1074 },
  },
  {
    id: "dsg-cp",
    name: "DSG CP",
    tags: "WEBFLOW, UI-UX, INTERACTIONS",
    href: "https://www.dsgcp.com/",
    image: { src: `${FRAMER}/LLDM6mptdFWDDjvOXzMhXSYwfE.webp`, alt: "DSG CP preview", width: 1792, height: 1014 },
  },
];
