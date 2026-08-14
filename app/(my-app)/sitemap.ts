import type { MetadataRoute } from "next";
import { site } from "@/data/site";
import { fetchStrapi } from "@/lib/strapi/client";

type SlugEntry = { slug: string; publishedAt: string };
type StrapiSlugList = { data: SlugEntry[]; meta: unknown };

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = (path: string) => ({ url: `${site.url}${path}` });

  const blogs = await fetchStrapi<StrapiSlugList>("/blogs", {
    "fields[0]": "slug",
    "fields[1]": "publishedAt",
    "pagination[limit]": "1000",
    "sort": "publishedDate:desc",
  });

  const blogEntries = blogs.data.map(({ slug, publishedAt }) => ({
    url: `${site.url}/blog/${slug}`,
    lastModified: new Date(publishedAt),
  }));

  return [
    // The homepage canonical resolves to the bare origin (metadataBase + "/"),
    // so the sitemap has to match it exactly. `url("/")` would emit a trailing
    // slash and disagree with the canonical on the site's most important URL.
    { url: site.url },
    url("/website-design-development"),
    url("/website-redesign"),
    url("/ai-training"),
    url("/projects"),
    url("/case-study/gokwik"),
    url("/case-study/accel-atoms-internal-review-application"),
    url("/blog"),
    url("/gallery"),
    url("/contact"),
    url("/privacy-policy"),
    url("/terms-and-conditions"),
    ...blogEntries,
  ];
}
