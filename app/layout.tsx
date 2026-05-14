import type { Metadata } from "next";
import { Inter, IBM_Plex_Serif, Fragment_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { FloatingMenuButton } from "@/components/ui/floating-menu";
import { site } from "@/data/site";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-inter",
  display: "swap",
});

const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-plex-serif",
  display: "swap",
});

const fragmentMono = Fragment_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-fragment-mono",
  display: "swap",
});

const rationalist = localFont({
  src: [
    {
      path: "../public/fonts/tt-rationalist-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/tt-rationalist-light.woff2",
      weight: "300",
      style: "normal",
    },
  ],
  variable: "--font-rationalist",
  display: "swap",
});

const normsSerif = localFont({
  src: [
    {
      path: "../public/fonts/tt-norms-serif-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/tt-norms-serif-bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-norms-serif",
  display: "swap",
});

const siteUrl = "https://epyc.in";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "EPYC | Website Development | Design Studio",
    template: "%s | EPYC",
  },
  description:
    "EPYC is a full-service creative studio bringing human-centric digital experiences to life, without Code. We build products that touch millions of lives, everyday.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "EPYC",
    title: "EPYC | Website Development | Design Studio",
    description:
      "EPYC is a full-service creative studio bringing human-centric digital experiences to life, without Code. We build products that touch millions of lives, everyday.",
  },
  twitter: {
    card: "summary_large_image",
    title: "EPYC | Website Development | Design Studio",
    description:
      "EPYC is a full-service creative studio bringing human-centric digital experiences to life, without Code. We build products that touch millions of lives, everyday.",
  },
  robots: { index: true, follow: true, "max-image-preview": "large" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontVariables = [
    inter.variable,
    ibmPlexSerif.variable,
    fragmentMono.variable,
    rationalist.variable,
    normsSerif.variable,
  ].join(" ");

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    logo: `${site.url}/icons/epyc-wordmark-large.svg`,
    description: site.description,
    sameAs: [
      site.social.x,
      site.social.instagram,
      site.social.linkedin,
      site.social.clutchProfile,
    ],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    description: site.description,
  };

  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <FloatingMenuButton />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </body>
    </html>
  );
}
