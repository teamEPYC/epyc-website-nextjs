import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const iconButton = cva(
  "inline-flex cursor-pointer items-center justify-center rounded-full transition duration-200 ease-out motion-reduce:transition-none active:scale-[0.92] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  {
    variants: {
      tone: {
        ink: "bg-ink text-cream hover:bg-ink/85 focus-visible:ring-ink/40 focus-visible:ring-offset-beige",
        crimson:
          "bg-crimson text-cream hover:bg-crimson/90 focus-visible:ring-crimson/40 focus-visible:ring-offset-beige",
        cream:
          "bg-cream text-ink hover:bg-cream/80 focus-visible:ring-cream focus-visible:ring-offset-ink",
      },
      size: {
        sm: "h-10 w-10",
        md: "h-12 w-12",
        lg: "h-[58px] w-[58px]",
      },
    },
    defaultVariants: { tone: "ink", size: "lg" },
  },
);

type CommonProps = VariantProps<typeof iconButton> & {
  className?: string;
  children: ReactNode;
  "aria-label": string;
};

type AnchorProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children" | "aria-label"> & {
    href: string;
  };

type ButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children" | "aria-label"> & {
    href?: undefined;
  };

function isInternal(href: string) {
  return href.startsWith("/") || href.startsWith("#");
}

export function IconButton(props: AnchorProps | ButtonProps) {
  const { tone, size, className, children, ...rest } = props;
  const classes = cn(iconButton({ tone, size }), className);

  if ("href" in rest && rest.href !== undefined) {
    const { href, target, rel, ...anchorRest } = rest as AnchorProps;
    if (isInternal(href)) {
      return (
        <Link href={href} className={classes} target={target} rel={rel} {...anchorRest}>
          {children}
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
        {children}
      </a>
    );
  }

  const buttonRest = rest as ButtonProps;
  return (
    <button type="button" className={classes} {...buttonRest}>
      {children}
    </button>
  );
}
