import type { MetadataRoute } from "next";
import { site } from "@/data/site";
import { fetchStrapi } from "@/lib/strapi/client";

type SlugEntry = { slug: string; publishedAt: string };
type StrapiSlugList = { data: SlugEntry[]; meta: unknown };

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const make = (
    path: string,
    priority: number,
    changeFrequency: "weekly" | "monthly" | "yearly" = "monthly",
    lastModified: Date = now,
  ) => ({
    url: `${site.url}${path}`,
    lastModified,
    changeFrequency,
    priority,
  });

  const [blogs, gallery] = await Promise.all([
    fetchStrapi<StrapiSlugList>("/blogs", {
      "fields[0]": "slug",
      "fields[1]": "publishedAt",
      "pagination[limit]": "1000",
      "sort": "publishedDate:desc",
    }),
    fetchStrapi<StrapiSlugList>("/gallery-items", {
      "fields[0]": "slug",
      "pagination[limit]": "1000",
    }),
  ]);

  const blogEntries = blogs.data.map(({ slug, publishedAt }) =>
    make(`/blog/${slug}`, 0.6, "monthly", new Date(publishedAt)),
  );
  const galleryEntries = gallery.data.map(({ slug }) =>
    make(`/gallery/${slug}`, 0.5),
  );

  return [
    make("/", 1.0, "weekly"),
    make("/projects", 0.8),
    make("/blog", 0.7),
    make("/gallery", 0.6),
    make("/contact", 0.8),
    make("/privacy-policy", 0.3, "yearly"),
    make("/terms-and-conditions", 0.3, "yearly"),
    ...blogEntries,
    ...galleryEntries,
  ];
}
