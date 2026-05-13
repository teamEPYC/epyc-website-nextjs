import Link from "next/link";
import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badge = cva(
  "inline-flex items-center gap-3 rounded-pill border px-6 py-2.5 text-body-sm transition-colors",
  {
    variants: {
      tone: {
        "cream-on-dark":
          "border-cream/40 text-cream hover:bg-cream/10",
        "ink-on-light":
          "border-ink/15 text-ink hover:bg-ink/5",
      },
    },
    defaultVariants: { tone: "cream-on-dark" },
  },
);

type CommonProps = VariantProps<typeof badge> & {
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
};

type AnchorProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children"> & {
    href: string;
  };

type StaticProps = CommonProps &
  Omit<HTMLAttributes<HTMLSpanElement>, "className" | "children"> & {
    href?: undefined;
  };

function isInternal(href: string) {
  return href.startsWith("/") || href.startsWith("#");
}

export function Badge(props: AnchorProps | StaticProps) {
  const { tone, icon, className, children, ...rest } = props;
  const classes = cn(badge({ tone }), className);
  const content = (
    <>
      {icon ? <span className="flex shrink-0 items-center">{icon}</span> : null}
      <span>{children}</span>
    </>
  );

  if ("href" in rest && rest.href !== undefined) {
    const { href, target, rel, ...anchorRest } = rest as AnchorProps;
    if (isInternal(href)) {
      return (
        <Link href={href} className={classes} target={target} rel={rel} {...anchorRest}>
          {content}
        </Link>
      );
    }
    return (
      <a
        href={href}
        target={target ?? "_blank"}
        rel={rel ?? "noopener noreferrer"}
        className={classes}
        {...anchorRest}
      >
        {content}
      </a>
    );
  }

  const spanRest = rest as StaticProps;
  return (
    <span className={classes} {...spanRest}>
      {content}
    </span>
  );
}
