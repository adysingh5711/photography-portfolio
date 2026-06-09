import type { MetadataRoute } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { SECTION_PATH, type SectionKey } from "@/lib/sections";
import { siteUrl } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl;
  const staticPaths = [
    "",
    "/portfolio",
    "/projects",
    "/stories",
    "/publications",
    "/commissions",
    "/about",
    "/news",
    "/contact",
  ];
  const entries: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${base}${p}`,
    changeFrequency: "weekly",
  }));

  try {
    const items = await fetchQuery(api.galleries.navItems);
    for (const i of items) {
      const sp = SECTION_PATH[i.section as SectionKey];
      if (sp) entries.push({ url: `${base}${sp}/${i.slug}` });
    }
  } catch {
    // Convex unreachable; static entries are enough.
  }
  return entries;
}
