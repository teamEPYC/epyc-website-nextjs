import type { Metadata } from 'next'
import { Inter, IBM_Plex_Serif, Fragment_Mono } from 'next/font/google'
import localFont from 'next/font/local'
import Script from 'next/script'
import './globals.css'
import { FloatingMenuButton } from '@/components/ui/floating-menu'
import { site } from '@/data/site'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-inter',
  display: 'swap',
})

const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ['latin'],
  weight: ['300', '400'],
  variable: '--font-plex-serif',
  display: 'swap',
})

const fragmentMono = Fragment_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-fragment-mono',
  display: 'swap',
})

const rationalist = localFont({
  src: [
    {
      path: '../../public/fonts/tt-rationalist-regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/tt-rationalist-light.woff2',
      weight: '300',
      style: 'normal',
    },
  ],
  variable: '--font-rationalist',
  display: 'swap',
})

const normsSerif = localFont({
  src: [
    {
      path: '../../public/fonts/tt-norms-serif-regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/tt-norms-serif-bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-norms-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: 'EPYC | Design & Development Studio for Ambitious Companies',
    template: '%s | EPYC',
  },
  description:
    'EPYC is a premium design & development studio. We build websites, apps, and digital products for ambitious companies. Polygon, Accel, Antler, and 75+ others trust us.',
  alternates: { canonical: '/' },
  // openGraph / twitter intentionally omit `title` & `description`: Next replaces
  // these nested objects wholesale per route (they are not deep-merged), so each
  // page's own `title`/`description` auto-populates its og:/twitter: tags.
  openGraph: {
    type: 'website',
    url: site.url,
    siteName: 'EPYC',
    images: [
      {
        url: '/og/default.jpg',
        width: 2400,
        height: 1260,
        alt: 'EPYC — Design & Development Studio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const fontVariables = [
    inter.variable,
    ibmPlexSerif.variable,
    fragmentMono.variable,
    rationalist.variable,
    normsSerif.variable,
  ].join(' ')

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.name,
    url: site.url,
    logo: `${site.url}/icons/epyc-wordmark-large.svg`,
    description: site.description,
    sameAs: [site.social.x, site.social.instagram, site.social.linkedin, site.social.clutchProfile],
  }

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.name,
    url: site.url,
    description: site.description,
  }

  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        {/* <FloatingMenuButton /> */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />

        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-9YP95GH3E0"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-9YP95GH3E0');
          `}
        </Script>

        {/* Microsoft Clarity */}
        <Script id="ms-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "i0rd9jx09z");
          `}
        </Script>

        {/* factors.ai */}
        <Script
          src="https://tag.clearbitscripts.com/v1/pk_0d660609b8ad02fad0229b6128d90366/tags.js"
          referrerPolicy="strict-origin-when-cross-origin"
          strategy="afterInteractive"
        />
        <Script id="faitracker-init" strategy="afterInteractive">
          {`
            ((window.faitracker = window.faitracker || (function(){
              this.q = [];
              var t = new CustomEvent("FAITRACKER_QUEUED_EVENT");
              return (
                (this.init = function(t,e,a){
                  ((this.TOKEN = t),(this.INIT_PARAMS = e),(this.INIT_CALLBACK = a),
                    window.dispatchEvent(new CustomEvent("FAITRACKER_INIT_EVENT")));
                }),
                (this.call = function(){
                  var e = { k: "", a: [] };
                  if (arguments && arguments.length >= 1) {
                    for (var a = 1; a < arguments.length; a++) e.a.push(arguments[a]);
                    e.k = arguments[0];
                  }
                  (this.q.push(e), window.dispatchEvent(t));
                }),
                (this.message = function(){
                  window.addEventListener("message", function(t){
                    "faitracker" === t.data.origin &&
                      this.call("message", t.data.type, t.data.message);
                  });
                }),
                this.message(),
                this.init("s1tpikwuqzyaue7gh10h97i1vz3zu1qo", {
                  host: "https://api.dyh8ken8pc.com",
                }),
                this
              );
            })()),
            (function(){
              var t = document.createElement("script");
              ((t.type = "text/javascript"),
                (t.src = "https://asset.dyh8ken8pc.com/dyh8ken8pc.js"),
                (t.async = !0),
                (d = document.getElementsByTagName("script")[0]).parentNode.insertBefore(t, d));
            })());
          `}
        </Script>
      </body>
    </html>
  )
}
