export type Blog = {
  slug: string
  title: string
  /** Pre-formatted display string shown in the card meta row, e.g. "November 8, 2023". */
  date?: string
  /** ISO yyyy-mm-dd, used for stable date-desc sorting. Will map to Payload `publishedAt`. */
  publishedAt: string
  readTime?: string
  image: { src: string; alt: string; width: number; height: number }
}

const FRAMER = 'https://framerusercontent.com/images'

export const blogs: Blog[] = [
  {
    slug: 'best-saas-websites-built-on-webflow',
    title: '5 Kickass SaaS Websites Built On Webflow',
    date: 'November 8, 2023',
    publishedAt: '2023-11-08',
    readTime: '5 Mins Read',
    image: { src: `${FRAMER}/c2sMhTg5rDpI718bGLxm7ObPBdo.webp`, alt: '', width: 1333, height: 833 },
  },
  {
    slug: 'webflow-custom-code-best-practices',
    title: '6 Rookie Mistakes To Avoid When Using Webflow Custom Code',
    date: 'September 29, 2023',
    publishedAt: '2023-09-29',
    readTime: '5 Mins Read',
    image: { src: `${FRAMER}/cf8NfzlgcdYjf9UTsUK3ZnXgL8.webp`, alt: '', width: 1335, height: 834 },
  },
  {
    slug: '8-must-try-open-source-low-code-platforms-for-developers',
    title: '8 Must-Try Open Source Low Code Platforms for Developers',
    date: 'June 17, 2025',
    publishedAt: '2025-06-17',
    image: {
      src: `${FRAMER}/AAZDQEQF48CAHwms21Kq5aikgsc.webp`,
      alt: 'Orange Flower',
      width: 644,
      height: 403,
    },
  },
  {
    slug: 'best-no-code-saas-builders',
    title: '10 Best no-code SaaS Builders You Can’t Miss In 2024',
    date: 'November 9, 2023',
    publishedAt: '2023-11-09',
    readTime: '12 Mins Read',
    image: { src: `${FRAMER}/zoJ1kO7vI4Ogo1oMKdvFjHWY8Y.webp`, alt: '', width: 1333, height: 833 },
  },
  {
    slug: 'b2b-saas-website-best-practices-everything-you-should-know',
    title: 'B2B SaaS Website Best Practices: Everything You Should Know in 2023',
    date: 'November 8, 2023',
    publishedAt: '2023-11-08',
    readTime: '5 Mins Read',
    image: { src: `${FRAMER}/nv8KKEa3dzVK2tRCfSPsROapmw.webp`, alt: '', width: 1333, height: 833 },
  },
  {
    slug: 'beginners-guide-getting-started-with-webflow-api-integration-in-2024',
    title: "Beginner's Guide: Getting Started with Webflow API Integration in 2024",
    publishedAt: '2024-01-01',
    image: {
      src: `${FRAMER}/3v03zXgQFjddV9w6qxRDPWcRKs.webp`,
      alt: 'Lilac Flower',
      width: 640,
      height: 401,
    },
  },
  {
    slug: 'build-a-game-in-5-minutes-without-coding',
    title: 'Build a Game in 5 Minutes Without Coding',
    date: 'December 4, 2024',
    publishedAt: '2024-12-04',
    image: { src: `${FRAMER}/ZEBP3fqoSUipwJiWDmH36MiMDk.webp`, alt: '', width: 1920, height: 1200 },
  },
  {
    slug: 'build-complex-web-apps-with-webflow',
    title: 'Can You Really Build Complex Web Apps Using WebFlow in 2023?',
    date: 'November 8, 2023',
    publishedAt: '2023-11-08',
    readTime: '7 Mins Read',
    image: { src: `${FRAMER}/eZpkYB1iuf8q4FVR4XG9NdBtqkg.webp`, alt: '', width: 1333, height: 833 },
  },
  {
    slug: 'glide-vs-adalo-no-code-comparison',
    title: 'Glide vs. Adalo: A Thorough Comparison of Speed, Design, and Functionality',
    date: 'September 15, 2023',
    publishedAt: '2023-09-15',
    readTime: '5 Mins Read',
    image: { src: `${FRAMER}/YnQgSdhVARbYeh9DF9t42htIao.webp`, alt: '', width: 1334, height: 835 },
  },
  {
    slug: 'webflow-multi-language-localization',
    title: 'Going Global with Webflow Multi Language',
    date: 'November 14, 2023',
    publishedAt: '2023-11-14',
    image: { src: `${FRAMER}/NmKR7ASdzUZZbkEf4CoZtNajTA.webp`, alt: '', width: 1333, height: 833 },
  },
  {
    slug: 'how-to-choose-the-right-webflow-development-agency',
    title: 'How to Choose the Right Webflow Development Agency?',
    date: 'September 11, 2023',
    publishedAt: '2023-09-11',
    readTime: '6 Mins Read',
    image: { src: `${FRAMER}/17S85Rv7RoBl2PCYZd22iUtwu8.webp`, alt: '', width: 1282, height: 802 },
  },
  {
    slug: 'how-to-integrate-google-analytics-with-your-webflow-website-in-2024',
    title: 'How to Integrate Google Analytics with Your Webflow Website in 2024',
    publishedAt: '2024-01-01',
    image: {
      src: `${FRAMER}/iO4zr7G113ItWsoU2qf18VF3U.webp`,
      alt: 'Yellow Flower',
      width: 641,
      height: 402,
    },
  },
  {
    slug: 'leveraging-antlers-next100-wisdom-for-micro-saas-ideas-in-2024',
    title: "Leveraging Antler's #Next100 Wisdom for Micro SaaS Ideas in 2024",
    publishedAt: '2024-01-01',
    image: { src: `${FRAMER}/jdg5bOINjk3Uc44i4ogyymJ2nM.webp`, alt: '', width: 640, height: 401 },
  },
  {
    slug: 'nivekithans-first-year-at-epyc',
    title: "Nivekithan's First Year at EPYC (Uncensored)",
    date: 'January 8, 2024',
    publishedAt: '2024-01-08',
    readTime: '3 Mins Read',
    image: { src: `${FRAMER}/VFAfIzgyTGdmMfvwQElDV4Cs6g.webp`, alt: '', width: 1333, height: 833 },
  },
  {
    slug: 'no-code-manifesto',
    title: 'No-code Manifesto',
    date: 'July 22, 2025',
    publishedAt: '2025-07-22',
    readTime: '5 Mins Read',
    image: {
      src: `${FRAMER}/7fKMp3JwupXJat6XPl7pc1njEvk.webp`,
      alt: 'Green Fern',
      width: 1000,
      height: 667,
    },
  },
  {
    slug: 'no-code-backend-platform',
    title: 'Picking The Right No-Code Backend Platform: A Buyer’s Guide in 2023',
    date: 'November 8, 2023',
    publishedAt: '2023-11-08',
    readTime: '6 Mins Read',
    image: { src: `${FRAMER}/0ddMLOV0Q6iCllry8PpkSYJao.webp`, alt: '', width: 1333, height: 833 },
  },
  {
    slug: 'rive-vs-lottie-animation-tool-for-webflow',
    title: 'Rive vs Lottie animation for Webflow',
    date: 'November 27, 2023',
    publishedAt: '2023-11-27',
    image: { src: `${FRAMER}/T8BqDnQBJJL004eBVuFxWcqwM.webp`, alt: '', width: 1333, height: 833 },
  },
  {
    slug: 'seamless-wordpress-to-webflow-migration-your-ultimate-guide-in-2023',
    title: 'Seamless WordPress to Webflow Migration: Your Ultimate Guide in 2023',
    date: 'September 11, 2023',
    publishedAt: '2023-09-11',
    readTime: '5 Mins Read',
    image: { src: `${FRAMER}/bjkC4Xv3xknfrcMZW8X8bCWU4g.webp`, alt: '', width: 1282, height: 802 },
  },
  {
    slug: 'shopify-vs-webflow-which-platform-wins-for-your-online-store',
    title: 'Shopify vs Webflow: Which Platform Wins for Your Online Store?',
    publishedAt: '2023-01-01',
    image: { src: `${FRAMER}/1LCaVh5Lj6tPEwmXG3UlFZY4.webp`, alt: '', width: 1333, height: 833 },
  },
  {
    slug: 'supercharge-your-no-code-apps-with-17-bubble-io-plugins',
    title: 'Supercharge Your No-Code Apps with 17 Bubble.io Plugins',
    publishedAt: '2023-01-01',
    image: { src: `${FRAMER}/2aNxE9JemI6ryTdjSDWbIg8GqU.webp`, alt: '', width: 648, height: 406 },
  },
  {
    slug: 'top-5-no-code-ai-use-cases-that-every-business-should-use-in-2023',
    title: 'Top 5 No-Code AI Use Cases that Every Business Should Use in 2023',
    date: 'June 7, 2025',
    publishedAt: '2025-06-07',
    readTime: '4 Mins Read',
    image: {
      src: `${FRAMER}/cqNHd7ot1BNrqy9C2WdyDrQKw.webp`,
      alt: 'Purple Flower',
      width: 1202,
      height: 676,
    },
  },
  {
    slug: 'wait-what-is-no-code',
    title: 'Wait, what is No-Code?',
    publishedAt: '2023-01-01',
    image: { src: `${FRAMER}/nN22VkliHuw2E48U007NuA4Vgk.webp`, alt: '', width: 2880, height: 1343 },
  },
  {
    slug: 'your-webflow-go-live-checklist-a-stress-free-way-to-launch-stunning-websites',
    title: 'Webflow Go-Live Checklist: A Stress-Free Way to Launch Stunning Websites',
    date: 'November 26, 2024',
    publishedAt: '2024-11-26',
    image: { src: `${FRAMER}/P2k2X8sZ4fcO0ioFzuakjQyCsA.webp`, alt: '', width: 1920, height: 1200 },
  },
  {
    slug: 'webflow-or-framer-finding-the-right-tool-for-your-website-development',
    title: 'Webflow or Framer? Finding the Right Tool for Your Website Development',
    publishedAt: '2024-01-01',
    image: { src: `${FRAMER}/WJoKzJzhegOaOCHREB3WNbaQ5RA.webp`, alt: '', width: 642, height: 402 },
  },
  {
    slug: 'webflow-vs-bubble-which-no-code-builder-should-you-choose',
    title: 'Webflow vs Bubble: Which No-Code Builder Should you Choose',
    date: 'September 8, 2023',
    publishedAt: '2023-09-08',
    readTime: '7 Mins Read',
    image: { src: `${FRAMER}/5r5tLgi0b8JELg61q3wPE5KrJJo.webp`, alt: '', width: 1334, height: 834 },
  },
  {
    slug: 'what-is-engineering',
    title: 'What is Engineering?',
    date: 'August 6, 2025',
    publishedAt: '2025-08-06',
    readTime: '2 Mins Read',
    image: { src: `${FRAMER}/8SyUOL70JFe8JFsT2cXckev7bPM.webp`, alt: '', width: 1333, height: 833 },
  },
  {
    slug: 'why-do-startups-want-apps-built-on-bubble-as-their-mvps',
    title: 'Why Do Startups Want Apps Built on Bubble as their MVPs',
    date: 'September 22, 2023',
    publishedAt: '2023-09-22',
    readTime: '6 Mins Read',
    image: { src: `${FRAMER}/WZyMCmyzVSZM0xqDgq7sub2BA.webp`, alt: '', width: 1334, height: 835 },
  },
]
