export type GalleryKind = 'image' | 'video'

export type GalleryItem = {
  slug: string
  kind: GalleryKind
  src: string
  alt?: string
  /** Natural aspect-ratio hint — `width / height` reserves vertical space
   *  before the asset loads so the masonry doesn't re-layout. */
  width: number
  height: number
  title?: string
  description?: string
  designers?: string[]
  previewLink?: string
}

export function titleFromSlug(slug: string): string {
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function getRelatedItems(slug: string, count = 3): GalleryItem[] {
  const i = galleryItems.findIndex((it) => it.slug === slug)
  if (i === -1) return galleryItems.slice(0, count)
  return Array.from(
    { length: count },
    (_, k) => galleryItems[(i + 1 + k) % galleryItems.length]!,
  )
}

export const galleryItems: GalleryItem[] = [
  // Square images (1080×1080-ish)
  {
    slug: 'epyc-tshirt-green',
    kind: 'image',
    src: '/images/gallery/OMyjT3SXVAVwLKBojgUECF2Ng.png',
    alt: 'EPYC merchandise t-shirt, green variant',
    width: 1080,
    height: 1080,
    title: 'EPYC Merchandise : T-Shirt Concept & Design (Green Variant)',
    designers: ['Ashish Kumar', 'Abhishek Aravind'],
    description:
      'A studio piece exploring identity through wearable design — the green variant of our in-house tee, photographed flat to let the print do the talking.',
  },
  {
    slug: 'aurevra-bottle',
    kind: 'image',
    src: '/images/gallery/xyuuUDJliPs9ngpNukigqnTSgt8.jpg',
    alt: 'Aurévra bottle design',
    width: 1080,
    height: 1080,
    title: 'Aurévra — Bottle Design',
    designers: ['Ashish Kumar'],
    description:
      'Packaging concept for Aurévra: a study in restraint, with form, weight, and label hierarchy doing the heavy lifting.',
  },
  {
    slug: 'accessories',
    kind: 'image',
    src: '/images/gallery/emK8bIl43jtIkb6hcViP52VX6y4.png',
    alt: 'Accessories',
    width: 1080,
    height: 1080,
    title: 'Studio Accessories',
    designers: ['Abhishek Aravind'],
    description:
      'A series of small, branded objects we use around the studio — stickers, pins, and patches that have a life of their own outside the screen.',
  },
  {
    slug: 'community',
    kind: 'image',
    src: '/images/gallery/6a9JIcCxX3Lk3vkbRSA7TJoEg.png',
    alt: 'Community illustration',
    width: 1080,
    height: 1080,
    title: 'Community',
    designers: ['Ashish Kumar'],
    description:
      'Editorial illustration capturing the energy of the people we build with — collaborators, partners, and the wider creative community.',
  },
  {
    slug: 'team',
    kind: 'image',
    src: '/images/gallery/9mDlYLtKG9g9WfLMRG3QGw8cdc.png',
    alt: 'Team',
    width: 1080,
    height: 1080,
    title: 'Team',
    designers: ['Abhishek Aravind'],
    description:
      'A look at how we picture ourselves: a small group, big ideas, and a willingness to follow them wherever they lead.',
  },
  {
    slug: 'podcast',
    kind: 'image',
    src: '/images/gallery/bKpwOHYbcnLHaOefoTRvF9Ng6o4.png',
    alt: 'Podcast',
    width: 1080,
    height: 1080,
    title: 'Podcast Cover Art',
    designers: ['Ashish Kumar', 'Abhishek Aravind'],
    description:
      'Cover artwork for the studio podcast — a recurring conversation with people we admire about craft, taste, and the long game.',
  },

  // Portrait videos (1080×1350 — ~4:5)
  {
    slug: 'letter-a',
    kind: 'video',
    src: 'https://files.epyc.in/videos/a.mp4',
    width: 1080,
    height: 1350,
  },
  {
    slug: 'letter-e',
    kind: 'video',
    src: 'https://files.epyc.in/videos/e.mp4',
    width: 1080,
    height: 1350,
  },
  {
    slug: 'letter-p',
    kind: 'video',
    src: 'https://files.epyc.in/videos/P-Post_1.mp4',
    width: 1080,
    height: 1350,
    title: 'Letter "P"',
    designers: ['Abhishek Aravind'],
    previewLink:
      'https://www.instagram.com/p/Cri9bLOvBt5/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==',
    description:
      "Using the incredible combination of Cinema 4D and Redshift by Maxon, with textures by Greyscalegorilla, we've brought this letter to life in a fun and dynamic way for 36 days of type.",
  },
  {
    slug: 'letter-y',
    kind: 'video',
    src: 'https://files.epyc.in/videos/Y-Post.mp4',
    width: 1080,
    height: 1350,
  },
  {
    slug: 'letter-c',
    kind: 'video',
    src: 'https://files.epyc.in/videos/c.mp4',
    width: 1080,
    height: 1350,
  },
  {
    slug: 'number-0',
    kind: 'video',
    src: 'https://files.epyc.in/videos/0-Post.mp4',
    width: 1080,
    height: 1350,
  },
  {
    slug: 'number-3',
    kind: 'video',
    src: 'https://files.epyc.in/videos/3-Post.mp4',
    width: 1080,
    height: 1350,
  },

  // Wide landscape mockups (16:9 / 16:10)
  {
    slug: 'mockup-1',
    kind: 'image',
    src: '/images/gallery/pgBLD8rSKjUj7DdnaaOUdYEwn1w.png',
    alt: 'Website mockup',
    width: 1440,
    height: 810,
  },
  {
    slug: 'mockup-2',
    kind: 'image',
    src: '/images/gallery/LyVYCrnbWNVwwzKe3FjUyvbBLOg.png',
    alt: 'Website mockup',
    width: 1440,
    height: 810,
  },
  {
    slug: 'mockup-3',
    kind: 'image',
    src: '/images/gallery/SNfmJjdl6hccJyBIZlPlM3QcGP8.png',
    alt: 'Website mockup',
    width: 1440,
    height: 810,
  },
  {
    slug: 'reception-scene',
    kind: 'image',
    src: '/images/gallery/PRjDB8UsXlSFQJuH9pMtRAzLhhA.png',
    alt: 'Reception scene render',
    width: 1440,
    height: 900,
  },
  {
    slug: 'hallway',
    kind: 'image',
    src: '/images/gallery/ec9TdJQhERvMsamL3kuvmDWx3Tw.png',
    alt: 'Hallway render',
    width: 1920,
    height: 1080,
  },

  // Tall portrait images (4:5)
  {
    slug: 'letter-h',
    kind: 'image',
    src: '/images/gallery/c5w76I0WJ70qGOtT7UkFsFMLpc.png',
    alt: 'Letter H',
    width: 2160,
    height: 2700,
  },
  {
    slug: 'letter-n',
    kind: 'image',
    src: '/images/gallery/j9bW5yoSJkzSqx9fJ2CcIHwhEk.png',
    alt: 'Letter N',
    width: 2160,
    height: 2700,
  },

  // Icon-style squares
  {
    slug: 'block',
    kind: 'image',
    src: '/images/gallery/JoyvtkTOnXDKM415MBg9yGzfbA.png',
    alt: 'Block illustration',
    width: 2048,
    height: 2048,
  },
  {
    slug: 'clarity',
    kind: 'image',
    src: '/images/gallery/JzQLWPwtcLJjewAWTYPt13ayrT0.png',
    alt: 'Clarity illustration',
    width: 1080,
    height: 1080,
  },
  {
    slug: 'finance',
    kind: 'image',
    src: '/images/gallery/A1NXr72iFrIWntUGsx8HF6a0yQ.png',
    alt: 'Finance illustration',
    width: 1080,
    height: 1080,
  },
  {
    slug: 'growth',
    kind: 'image',
    src: '/images/gallery/J8ufrwqz8ce3ubGA56jIRbYCmsc.png',
    alt: 'Growth illustration',
    width: 1080,
    height: 1080,
  },
  {
    slug: 'speed',
    kind: 'image',
    src: '/images/gallery/nBNVO0nfb38xD4BcFB01KFztjEc.png',
    alt: 'Speed illustration',
    width: 1080,
    height: 1080,
  },
  {
    slug: 'question-sign',
    kind: 'image',
    src: '/images/gallery/LBzBqCCwobgvWph20I118gQMus4.png',
    alt: 'Question sign illustration',
    width: 1080,
    height: 1080,
  },
]
