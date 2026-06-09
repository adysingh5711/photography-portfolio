import type { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

/** Best-effort dynamic title for a gallery detail page. */
export async function galleryMetadata(
  slug: string,
  fallback: string,
): Promise<Metadata> {
  try {
    const g = await fetchQuery(api.galleries.getBySlug, { slug });
    if (g) return { title: g.title, description: g.statement ?? undefined };
  } catch {
    // Convex may be unreachable during build; fall through to the fallback.
  }
  return { title: fallback };
}

/** Best-effort dynamic title for a news post. */
export async function newsMetadata(slug: string): Promise<Metadata> {
  try {
    const p = await fetchQuery(api.news.getBySlug, { slug });
    if (p) return { title: p.title, description: p.excerpt ?? undefined };
  } catch {
    // ignore
  }
  return { title: "News" };
}
