export type NavLink = {
  label: string;
  href: string;
};

export const footerColumns: NavLink[][] = [
  [
    { label: "Projects", href: "/projects" },
    { label: "Blog", href: "/blogs" },
    { label: "Gallery", href: "/gallery" },
  ],
  [
    { label: "Contact", href: "/contact" },
    { label: "Instagram", href: "https://instagram.com/teamepyc" },
    { label: "LinkedIn", href: "https://www.linkedin.com/company/epyc/" },
  ],
  [
    { label: "X", href: "https://x.com/teamepyc" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms & Conditions", href: "/terms-and-conditions" },
  ],
];

export const menuLinks: NavLink[] = [
  { label: "Projects", href: "/projects" },
  { label: "Blog", href: "/blogs" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

export const pronunciationLines: string[] = [
  "/Bubble Bronze Agency",
  "/Webflow Professional Agency",
  "/Framer Enterprise Agency",
];
