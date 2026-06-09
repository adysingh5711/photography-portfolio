"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { GalleryGrid } from "./GalleryGrid";
import type { SectionKey } from "@/lib/sections";

function GridSkeleton() {
  return (
    <ul className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="aspect-[4/5] animate-pulse bg-faint" />
      ))}
    </ul>
  );
}

export function SectionIndex({
  section,
  title,
  basePath,
}: {
  section: SectionKey;
  title: string;
  basePath: string;
}) {
  const items = useQuery(api.galleries.listSection, { section });
  return (
    <div>
      <h1 className="mb-8 text-xl tracking-wide text-ink">{title}</h1>
      {items === undefined ? (
        <GridSkeleton />
      ) : (
        <GalleryGrid items={items} basePath={basePath} />
      )}
    </div>
  );
}
