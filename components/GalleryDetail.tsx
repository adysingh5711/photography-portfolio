"use client";

import { useCallback, useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SmartImage } from "./SmartImage";

export function GalleryDetail({ slug }: { slug: string }) {
  const gallery = useQuery(api.galleries.getBySlug, { slug });
  const [lightbox, setLightbox] = useState<number | null>(null);

  const images = gallery?.images ?? [];
  const close = useCallback(() => setLightbox(null), []);
  const step = useCallback(
    (dir: number) =>
      setLightbox((i) =>
        i === null ? i : (i + dir + images.length) % images.length,
      ),
    [images.length],
  );

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, close, step]);

  if (gallery === undefined) {
    return <div className="h-[60vh] animate-pulse bg-faint" />;
  }
  if (gallery === null) {
    return <p className="text-muted">This gallery could not be found.</p>;
  }

  return (
    <article>
      <header className="mb-10 max-w-2xl">
        <h1 className="text-2xl tracking-wide text-ink">{gallery.title}</h1>
        {gallery.subtitle && (
          <p className="mt-1 nav-label text-muted">{gallery.subtitle}</p>
        )}
        {gallery.statement && (
          <p className="mt-5 whitespace-pre-line text-ink/80">
            {gallery.statement}
          </p>
        )}
      </header>

      <div className="mx-auto flex max-w-[920px] flex-col gap-6 md:gap-10">
        {images.map((img, i) => (
          <button
            key={img._id}
            type="button"
            onClick={() => setLightbox(i)}
            className="block w-full cursor-zoom-in"
          >
            <SmartImage
              url={img.url}
              alt={img.alt}
              width={img.width}
              height={img.height}
              blurDataUrl={img.blurDataUrl}
              priority={i === 0}
              sizes="(max-width: 768px) 100vw, 920px"
              className="h-auto w-full"
            />
            {img.caption && (
              <span className="mt-1 block text-left text-[0.8rem] text-muted">
                {img.caption}
              </span>
            )}
          </button>
        ))}
      </div>

      {lightbox !== null && images[lightbox] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={close}
        >
          <button
            className="absolute right-5 top-4 nav-label text-white/70 hover:text-white"
            onClick={close}
          >
            Close
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 px-3 text-2xl text-white/60 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
            aria-label="Previous"
          >
            ‹
          </button>
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[lightbox].url ?? ""}
              alt={images[lightbox].alt}
              className="max-h-[90vh] max-w-[90vw] object-contain"
            />
          </div>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 px-3 text-2xl text-white/60 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
            aria-label="Next"
          >
            ›
          </button>
        </div>
      )}
    </article>
  );
}
