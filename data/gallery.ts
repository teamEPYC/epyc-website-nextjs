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
}

export const galleryItems: GalleryItem[] = [
  // Square images (1080×1080-ish)
  {
    slug: 'epyc-tshirt-green',
    kind: 'image',
    src: 'https://framerusercontent.com/images/OMyjT3SXVAVwLKBojgUECF2Ng.png',
    alt: 'EPYC merchandise t-shirt, green variant',
    width: 1080,
    height: 1080,
  },
  {
    slug: 'aurevra-bottle',
    kind: 'image',
    src: 'https://framerusercontent.com/images/xyuuUDJliPs9ngpNukigqnTSgt8.jpg',
    alt: 'Aurévra bottle design',
    width: 1080,
    height: 1080,
  },
  {
    slug: 'accessories',
    kind: 'image',
    src: 'https://framerusercontent.com/images/emK8bIl43jtIkb6hcViP52VX6y4.png',
    alt: 'Accessories',
    width: 1080,
    height: 1080,
  },
  {
    slug: 'community',
    kind: 'image',
    src: 'https://framerusercontent.com/images/6a9JIcCxX3Lk3vkbRSA7TJoEg.png',
    alt: 'Community illustration',
    width: 1080,
    height: 1080,
  },
  {
    slug: 'team',
    kind: 'image',
    src: 'https://framerusercontent.com/images/9mDlYLtKG9g9WfLMRG3QGw8cdc.png',
    alt: 'Team',
    width: 1080,
    height: 1080,
  },
  {
    slug: 'podcast',
    kind: 'image',
    src: 'https://framerusercontent.com/images/bKpwOHYbcnLHaOefoTRvF9Ng6o4.png',
    alt: 'Podcast',
    width: 1080,
    height: 1080,
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
    src: 'https://framerusercontent.com/images/pgBLD8rSKjUj7DdnaaOUdYEwn1w.png',
    alt: 'Website mockup',
    width: 1440,
    height: 810,
  },
  {
    slug: 'mockup-2',
    kind: 'image',
    src: 'https://framerusercontent.com/images/LyVYCrnbWNVwwzKe3FjUyvbBLOg.png',
    alt: 'Website mockup',
    width: 1440,
    height: 810,
  },
  {
    slug: 'mockup-3',
    kind: 'image',
    src: 'https://framerusercontent.com/images/SNfmJjdl6hccJyBIZlPlM3QcGP8.png',
    alt: 'Website mockup',
    width: 1440,
    height: 810,
  },
  {
    slug: 'reception-scene',
    kind: 'image',
    src: 'https://framerusercontent.com/images/PRjDB8UsXlSFQJuH9pMtRAzLhhA.png',
    alt: 'Reception scene render',
    width: 1440,
    height: 900,
  },
  {
    slug: 'hallway',
    kind: 'image',
    src: 'https://framerusercontent.com/images/ec9TdJQhERvMsamL3kuvmDWx3Tw.png',
    alt: 'Hallway render',
    width: 1920,
    height: 1080,
  },

  // Tall portrait images (4:5)
  {
    slug: 'letter-h',
    kind: 'image',
    src: 'https://framerusercontent.com/images/c5w76I0WJ70qGOtT7UkFsFMLpc.png',
    alt: 'Letter H',
    width: 2160,
    height: 2700,
  },
  {
    slug: 'letter-n',
    kind: 'image',
    src: 'https://framerusercontent.com/images/j9bW5yoSJkzSqx9fJ2CcIHwhEk.png',
    alt: 'Letter N',
    width: 2160,
    height: 2700,
  },

  // Icon-style squares
  {
    slug: 'block',
    kind: 'image',
    src: 'https://framerusercontent.com/images/JoyvtkTOnXDKM415MBg9yGzfbA.png',
    alt: 'Block illustration',
    width: 2048,
    height: 2048,
  },
  {
    slug: 'clarity',
    kind: 'image',
    src: 'https://framerusercontent.com/images/JzQLWPwtcLJjewAWTYPt13ayrT0.png',
    alt: 'Clarity illustration',
    width: 1080,
    height: 1080,
  },
  {
    slug: 'finance',
    kind: 'image',
    src: 'https://framerusercontent.com/images/A1NXr72iFrIWntUGsx8HF6a0yQ.png',
    alt: 'Finance illustration',
    width: 1080,
    height: 1080,
  },
  {
    slug: 'growth',
    kind: 'image',
    src: 'https://framerusercontent.com/images/J8ufrwqz8ce3ubGA56jIRbYCmsc.png',
    alt: 'Growth illustration',
    width: 1080,
    height: 1080,
  },
  {
    slug: 'speed',
    kind: 'image',
    src: 'https://framerusercontent.com/images/nBNVO0nfb38xD4BcFB01KFztjEc.png',
    alt: 'Speed illustration',
    width: 1080,
    height: 1080,
  },
  {
    slug: 'question-sign',
    kind: 'image',
    src: 'https://framerusercontent.com/images/LBzBqCCwobgvWph20I118gQMus4.png',
    alt: 'Question sign illustration',
    width: 1080,
    height: 1080,
  },
]
