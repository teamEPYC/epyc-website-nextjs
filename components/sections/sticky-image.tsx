import Image from "next/image";

/**
 * Sticky 100vh paper-texture image with a top gradient fade-in from ink.
 * Hidden below lg. The Image (fill) is wrapped in its own relative div
 * because next/image's `fill` requires a non-sticky positioned parent.
 */
export function StickyImage() {
  return (
    <section
      aria-hidden="true"
      className="hidden h-screen w-full lg:sticky lg:top-0 lg:block"
    >
      <div className="relative h-full w-full overflow-hidden">
        <Image
          src="https://framerusercontent.com/images/nrsbyLofw3hQwQOWoECajIlhuY.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[14%]"
          style={{
            background:
              "linear-gradient(180deg, var(--color-ink) 0%, rgba(24, 50, 41, 0) 100%)",
          }}
        />
      </div>
    </section>
  );
}
