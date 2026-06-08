"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { MenuLines } from "@/components/icons/menu-lines";

type MenuLink = { label: string; href: string };

type FloatingMenuButtonProps = {
  links?: MenuLink[];
  className?: string;
};

const defaultLinks: MenuLink[] = [
  { label: "Projects", href: "/projects" },
  { label: "Blog", href: "/blog" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
  { label: "Studio", href: "/studio" },
];

function isInternal(href: string) {
  return href.startsWith("/") || href.startsWith("#");
}

export function FloatingMenuButton({
  links = defaultLinks,
  className,
}: FloatingMenuButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "fixed bottom-5 left-1/2 z-50 -translate-x-1/2",
        className,
      )}
    >
      <div
        className={cn(
          "flex flex-col items-center gap-6 rounded-[32px] bg-cream p-2 shadow-[0_1px_22px_10px_rgba(0,0,0,0.12)] transition-all",
          open ? "w-[280px] px-2 py-4" : "w-auto",
        )}
      >
        {open ? (
          <ul className="flex w-full flex-col gap-1">
            {links.map((link) => {
              const internal = isInternal(link.href);
              return (
                <li key={link.href}>
                  {internal ? (
                    <Link
                      href={link.href}
                      className="block rounded-md px-4 py-3 text-body text-ink hover:bg-beige/60"
                      onClick={() => setOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-md px-4 py-3 text-body text-ink hover:bg-beige/60"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        ) : null}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-[34px] items-center gap-2 rounded-full px-4 text-ink hover:bg-beige/40"
        >
          <MenuLines size={28} className="text-ink" />
          <span className="text-body">Menu</span>
        </button>
      </div>
    </div>
  );
}
