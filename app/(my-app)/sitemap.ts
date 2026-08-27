import type { MetadataRoute } from "next";
import { site } from "@/data/site";
import { getCMS } from "@/lib/cms";
import { isPreviewDeployment } from "@/lib/cms/config";

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (isPreviewDeployment()) return [];
  const url = (path: string) => ({ url: `${site.url}${path}` });

  const blogs = await getCMS().listBlogSlugsForSitemap();

  const blogEntries = blogs.map(({ slug, publishedAt }) => ({
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
