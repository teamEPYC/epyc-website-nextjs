import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type ServiceCardProps = {
  title: ReactNode;
  body: ReactNode;
  className?: string;
  align?: "center" | "start";
};

export function ServiceCard({
  title,
  body,
  className,
  align = "center",
}: ServiceCardProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col justify-center gap-3 p-8 lg:p-12",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      <h3 className="text-h3 text-cream">{title}</h3>
      <p
        className={cn(
          "text-body-lg",
          align === "center" ? "max-w-md text-cream/85" : "text-cream/85",
        )}
      >
        {body}
      </p>
    </div>
  );
}
