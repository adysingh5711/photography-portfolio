import Link from "next/link";
import { SmartImage } from "./SmartImage";

export type GalleryCard = {
  slug: string;
  title: string;
  subtitle?: string;
  coverUrl: string | null;
};

/** Responsive grid of gallery cards used on section index + portfolio pages. */
export function GalleryGrid({
  items,
  basePath,
}: {
  items: GalleryCard[];
  basePath: string;
}) {
  if (items.length === 0) {
    return <p className="text-muted">Nothing here yet.</p>;
  }
  return (
    <ul className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((g) => (
        <li key={g.slug}>
          <Link href={`${basePath}/${g.slug}`} className="group block">
            <div className="relative aspect-[4/5] overflow-hidden bg-faint">
              <SmartImage
                url={g.coverUrl}
                alt={g.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-opacity duration-300 group-hover:opacity-85"
              />
            </div>
            <div className="mt-2">
              <span className="block text-ink">{g.title}</span>
              {g.subtitle && (
                <span className="block text-[0.82rem] text-muted">
                  {g.subtitle}
                </span>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
