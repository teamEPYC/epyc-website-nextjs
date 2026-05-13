import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Plus } from "@/components/icons/plus";

type FAQItemProps = {
  question: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
};

/**
 * SSR-safe accordion using native <details>/<summary>. Works without JS.
 * The plus icon rotates 45deg when [open], becoming an "X" — no separate Minus icon needed.
 */
export function FAQItem({
  question,
  children,
  defaultOpen = false,
  className,
}: FAQItemProps) {
  return (
    <details
      open={defaultOpen}
      className={cn(
        "group w-full border-b border-cream/40 py-6 [&_summary::-webkit-details-marker]:hidden",
        className,
      )}
    >
      <summary className="flex cursor-pointer items-center justify-between gap-6 text-cream marker:hidden">
        <span className="text-body-lg max-w-[90%]">{question}</span>
        <Plus
          size={24}
          className="shrink-0 transition-transform duration-200 group-open:rotate-45"
        />
      </summary>
      <div className="mt-4 max-w-[90%] text-body text-cream/80">{children}</div>
    </details>
  );
}
