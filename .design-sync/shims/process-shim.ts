// Minimal `process` global for design-sync preview bundles.
//
// Next.js client internals (next/link, next/image) read `process.env.__NEXT_*`
// at MODULE SCOPE. The converter only defines `process.env.NODE_ENV`, so every
// other access throws "ReferenceError: process is not defined" while
// _ds_bundle.js is still initializing — which blanks every preview card, not
// just the ones using Link/Image.
//
// Listed in cfg.extraEntries so it lands ahead of the main entry in
// .bundle-entry.mjs and therefore runs before any Next module body.

const g = globalThis as unknown as {
  process?: Record<string, unknown>;
  __dirname?: string;
  __filename?: string;
};

// next/image reads its config from `process.env.__NEXT_IMAGE_OPTS`, which only
// exists because the Next compiler defines it. Without it, next/image falls
// back to built-in defaults and throws "hostname … is not configured" for every
// image on the R2 CDN. `unoptimized: true` is the honest preview behaviour:
// there is no Next server here to serve /_next/image, so src passes through as
// authored (the same thing the repo's custom lib/image-loader.ts does in prod).
const IMAGE_OPTS = {
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  path: '/_next/image',
  // 'custom' would demand the compiler-injected loaderFile and throw
  // "missing loader prop"; with unoptimized:true the default loader is never
  // called to build a srcSet, so this value is inert.
  loader: 'default',
  dangerouslyAllowSVG: true,
  unoptimized: true,
  domains: [],
  remotePatterns: [],
  localPatterns: undefined,
  qualities: undefined,
  formats: ['image/avif', 'image/webp'],
};

if (typeof g.process === 'undefined') {
  g.process = {
    env: { NODE_ENV: 'development', __NEXT_IMAGE_OPTS: IMAGE_OPTS },
    platform: 'browser',
    nextTick: (fn: (...a: unknown[]) => void, ...args: unknown[]) => {
      setTimeout(() => fn(...args), 0);
    },
  };
}

// next/image pulls in ncc-packed Next modules that touch CommonJS `__dirname`
// during lazy module init ("__nccwpck_require__.ab = __dirname + '/'"). The
// guard around it is truthy in this bundle, so without these the FIRST
// image-using component to initialize throws and blanks its card.
if (typeof g.__dirname === 'undefined') g.__dirname = '/';
if (typeof g.__filename === 'undefined') g.__filename = '/index.js';

export {};
