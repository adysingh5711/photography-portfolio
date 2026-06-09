import type { Metadata } from "next";
import { GalleryDetail } from "@/components/GalleryDetail";
import { galleryMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return galleryMetadata(slug, "Projects");
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <GalleryDetail slug={slug} />;
}
