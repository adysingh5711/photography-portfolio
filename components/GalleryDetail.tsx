"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SmartImage } from "./SmartImage";
import { SECTION_PATH, type SectionKey } from "@/lib/sections";

export function GalleryDetail({ slug }: { slug: string }) {
  const gallery = useQuery(api.galleries.getBySlug, { slug });
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [scrollY, setScrollY] = useState(0);

  const sectionGalleries = useQuery(
    api.galleries.listSection,
    gallery ? { section: gallery.section } : "skip"
  );

  const images = gallery?.images ?? [];
  const heroImage = images[0];
  const masonryImages = images.slice(1);

  const close = useCallback(() => setLightbox(null), []);
  const step = useCallback(
    (dir: number) =>
      setLightbox((i) =>
        i === null ? i : (i + dir + images.length) % images.length,
      ),
    [images.length],
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  let prevGallery: { slug: string; title: string } | null = null;
  let nextGallery: { slug: string; title: string } | null = null;

  if (sectionGalleries && sectionGalleries.length > 1) {
    const currentIndex = sectionGalleries.findIndex((g) => g.slug === gallery.slug);
    if (currentIndex !== -1) {
      const len = sectionGalleries.length;
      prevGallery = sectionGalleries[(currentIndex - 1 + len) % len];
      nextGallery = sectionGalleries[(currentIndex + 1) % len];
    }
  }

  const textOpacity = Math.max(0, 1 - scrollY / 300);
  const textTranslateY = -scrollY * 0.1;

  return (
    <article className="relative">
      <div className="relative mb-12">
        {/* 1. Sticky, fade-out header */}
        <div
          className="sticky top-20 z-10 flex flex-col justify-center min-h-[30vh] md:min-h-[40vh] py-8 md:py-16 transition-opacity duration-75"
          style={{
            opacity: textOpacity,
            transform: `translateY(${textTranslateY}px)`,
          }}
        >
          <h1 className="text-3xl md:text-4xl tracking-wide text-ink font-light">
            {gallery.title}
          </h1>
          {gallery.subtitle && (
            <p className="mt-2 nav-label text-muted">{gallery.subtitle}</p>
          )}
          {gallery.statement && (
            <p className="mt-6 max-w-2xl whitespace-pre-line text-ink/80 text-sm leading-relaxed">
              {gallery.statement}
            </p>
          )}
        </div>

        {/* 2. Full-viewport parallax cover image */}
        {heroImage && (
          <button
            type="button"
            onClick={() => setLightbox(0)}
            className="relative z-20 -mx-5 md:-mx-12 h-[80vh] md:h-[90vh] bg-ground shadow-sm overflow-hidden group/hero block w-[calc(100%+2.5rem)] md:w-[calc(100%+6rem)] cursor-zoom-in text-left border-none p-0 outline-none"
          >
            <SmartImage
              url={heroImage.url}
              alt={heroImage.alt}
              fill
              priority
              sizes="100vw"
              className="object-cover transition-transform duration-700 ease-out group-hover/hero:scale-[1.01]"
            />
          </button>
        )}
      </div>

      {/* 3. Section Navigation (Next/Prev Buttons) */}
      <div className="flex justify-between items-center py-6 border-b border-faint mb-12 relative z-20 bg-ground">
        {prevGallery ? (
          <Link
            href={`${SECTION_PATH[gallery.section as SectionKey]}/${prevGallery.slug}`}
            className="group flex items-center gap-2 text-muted hover:text-ink transition-colors"
          >
            <span className="text-lg transition-transform group-hover:-translate-x-1">
              ←
            </span>
            <span className="nav-label">{prevGallery.title}</span>
          </Link>
        ) : (
          <div />
        )}
        {nextGallery ? (
          <Link
            href={`${SECTION_PATH[gallery.section as SectionKey]}/${nextGallery.slug}`}
            className="group flex items-center gap-2 text-muted hover:text-ink transition-colors"
          >
            <span className="nav-label">{nextGallery.title}</span>
            <span className="text-lg transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        ) : (
          <div />
        )}
      </div>

      {/* 4. Masonry Grid of Remaining Images */}
      {masonryImages.length > 0 && (
        <div className="mx-auto max-w-[920px] columns-1 gap-6 sm:columns-2 lg:columns-3 [column-fill:_balance] relative z-20 bg-ground">
          {masonryImages.map((img, i) => (
            <div key={img._id} className="break-inside-avoid mb-6">
              <button
                type="button"
                onClick={() => setLightbox(i + 1)}
                className="block w-full cursor-zoom-in"
              >
                <SmartImage
                  url={img.url}
                  alt={img.alt}
                  width={img.width}
                  height={img.height}
                  blurDataUrl={img.blurDataUrl}
                  priority={false}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 330px"
                  className="h-auto w-full"
                />
                {img.caption && (
                  <span className="mt-1 block text-left text-[0.8rem] text-muted">
                    {img.caption}
                  </span>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

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
