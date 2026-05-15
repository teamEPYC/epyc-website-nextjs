import type { MetadataRoute } from "next";
import { site } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const make = (
    path: string,
    priority: number,
    changeFrequency: "weekly" | "monthly" | "yearly" = "monthly",
  ) => ({
    url: `${site.url}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });

  return [
    make("/", 1.0, "weekly"),
    make("/projects", 0.8),
    make("/blogs", 0.7),
    make("/gallery", 0.6),
    make("/contact", 0.8),
    make("/styleguide", 0.3),
    make("/privacy-policy", 0.3, "yearly"),
    make("/terms-and-conditions", 0.3, "yearly"),
  ];
}
