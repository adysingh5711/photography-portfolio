"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SmartImage } from "./SmartImage";
import { SECTION_PATH, type SectionKey } from "@/lib/sections";

export function HomeFeatured() {
  const featured = useQuery(api.galleries.featured);

  if (featured === undefined) {
    return <div className="h-[70vh] animate-pulse bg-faint" />;
  }
  if (featured === null) {
    return (
      <div className="text-muted">
        <p>No work has been published yet.</p>
        <Link href="/admin" className="mt-2 inline-block text-ink underline">
          Go to the admin to add galleries →
        </Link>
      </div>
    );
  }

  const href = `${SECTION_PATH[featured.section as SectionKey]}/${featured.slug}`;
  const [hero, ...rest] = featured.images;

  return (
    <article>
      <p className="nav-label text-muted">Recent Work</p>
      <h1 className="mt-2 text-3xl tracking-wide text-ink">{featured.title}</h1>
      {featured.subtitle && (
        <p className="mt-1 text-muted">{featured.subtitle}</p>
      )}

      {hero && (
        <Link href={href} className="mt-8 block">
          <SmartImage
            url={hero.url}
            alt={hero.alt}
            width={hero.width}
            height={hero.height}
            blurDataUrl={hero.blurDataUrl}
            priority
            sizes="(max-width: 768px) 100vw, 1100px"
            className="h-auto w-full"
          />
        </Link>
      )}

      {featured.statement && (
        <p className="mx-auto mt-8 max-w-2xl whitespace-pre-line text-ink/80">
          {featured.statement}
        </p>
      )}

      {rest.length > 0 && (
        <div className="mx-auto mt-10 max-w-230 columns-1 gap-6 sm:columns-2 [column-fill:balance]">
          {rest.slice(0, 4).map((img) => (
            <div key={img._id} className="break-inside-avoid mb-6">
              <SmartImage
                url={img.url}
                alt={img.alt}
                width={img.width}
                height={img.height}
                blurDataUrl={img.blurDataUrl}
                sizes="(max-width: 768px) 100vw, 460px"
                className="h-auto w-full"
              />
            </div>
          ))}
        </div>
      )}

      <Link
        href={href}
        className="mt-10 inline-block nav-label text-muted hover:text-ink"
      >
        View the full series →
      </Link>
    </article>
  );
}
