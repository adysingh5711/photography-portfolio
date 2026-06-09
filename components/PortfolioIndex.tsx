"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SmartImage } from "./SmartImage";
import { SECTION_PATH, type SectionKey } from "@/lib/sections";

export function PortfolioIndex() {
  const items = useQuery(api.galleries.portfolio);

  return (
    <div>
      <h1 className="mb-8 text-xl tracking-wide text-ink">Portfolio</h1>
      {items === undefined ? (
        <ul className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <li key={i} className="aspect-[4/5] animate-pulse bg-faint" />
          ))}
        </ul>
      ) : (
        <ul className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-3">
          {items.map((g) => (
            <li key={g._id}>
              <Link
                href={`${SECTION_PATH[g.section as SectionKey]}/${g.slug}`}
                className="group block"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-faint">
                  <SmartImage
                    url={g.coverUrl}
                    alt={g.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-opacity duration-300 group-hover:opacity-85"
                  />
                </div>
                <span className="mt-2 block text-ink">{g.title}</span>
                {g.subtitle && (
                  <span className="block text-[0.82rem] text-muted">
                    {g.subtitle}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
