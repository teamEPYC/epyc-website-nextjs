import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { ArrowDown } from "@/components/icons/arrow-down";
import { ArrowRight } from "@/components/icons/arrow-right";

const button = cva(
  // Base: layout + interaction. Font-family + font-size come from the `size`
  // variant (text-body / text-body-lg are typography utilities, not color).
  // Color comes from the `variant` (text-cream / text-ink). The icon inherits
  // color via currentColor because it's rendered without an own `text-*` class.
  [
    "inline-flex items-center justify-center gap-3 rounded-pill whitespace-nowrap",
    "transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson/40 focus-visible:ring-offset-2 focus-visible:ring-offset-beige",
    "disabled:pointer-events-none disabled:opacity-50",
  ].join(" "),
  {
    variants: {
      variant: {
        filled: "bg-crimson text-cream hover:bg-crimson/90",
        outline:
          "border border-ink/15 bg-transparent text-ink hover:bg-ink/5 data-[on-dark=true]:border-cream/40 data-[on-dark=true]:text-cream data-[on-dark=true]:hover:bg-cream/10",
      },
      size: {
        // Both sizes use Norms Serif (text-body) — matches the Framer source
        // (preset `1it29pb`: 16px Norms Pro Serif Regular at desktop).
        md: "text-body px-6 py-2.5",
        lg: "text-body px-9 py-4",
      },
    },
    defaultVariants: { variant: "filled", size: "lg" },
  },
);

type IconKey = "arrow-down" | "arrow-right";

type CommonProps = VariantProps<typeof button> & {
  icon?: IconKey;
  className?: string;
  children: ReactNode;
};

type AnchorProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children"> & {
    href: string;
  };

type ButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

const iconMap = {
  "arrow-down": ArrowDown,
  "arrow-right": ArrowRight,
} as const;

function isInternal(href: string) {
  return href.startsWith("/") || href.startsWith("#");
}

export function Button(props: AnchorProps | ButtonProps) {
  const { variant, size, icon, className, children, ...rest } = props;
  const classes = cn(button({ variant, size }), className);
  const Icon = icon ? iconMap[icon] : null;
  const content = (
    <>
      <span>{children}</span>
      {/* Icon has no own `text-*` class — inherits parent color via currentColor. */}
      {Icon ? <Icon size={14} className="shrink-0" /> : null}
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

  const buttonRest = rest as ButtonProps;
  return (
    <button type="button" className={classes} {...buttonRest}>
      {content}
    </button>
  );
}
