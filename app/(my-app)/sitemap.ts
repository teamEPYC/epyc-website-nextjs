import type { MetadataRoute } from "next";
import { site } from "@/data/site";
import { fetchStrapi } from "@/lib/strapi/client";

type SlugEntry = { slug: string; publishedAt: string };
type StrapiSlugList = { data: SlugEntry[]; meta: unknown };

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = (path: string) => ({ url: `${site.url}${path}` });

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

  const blogEntries = blogs.data.map(({ slug, publishedAt }) => ({
    url: `${site.url}/blog/${slug}`,
    lastModified: new Date(publishedAt),
  }));

  const galleryEntries = gallery.data.map(({ slug }) =>
    url(`/gallery/${slug}`),
  );

  return [
    url("/"),
    url("/projects"),
    url("/blog"),
    url("/gallery"),
    url("/contact"),
    url("/privacy-policy"),
    url("/terms-and-conditions"),
    ...blogEntries,
    ...galleryEntries,
  ];
}
