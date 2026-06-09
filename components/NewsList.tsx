"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function formatDate(iso: string) {
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-GB", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
}

export function NewsList() {
  const posts = useQuery(api.news.list);

  if (posts === undefined) {
    return <div className="h-64 animate-pulse bg-faint" />;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-8 text-xl tracking-wide text-ink">News</h1>
      {posts.length === 0 ? (
        <p className="text-muted">No news yet.</p>
      ) : (
        <ul className="space-y-8">
          {posts.map((p) => (
            <li key={p.slug}>
              <p className="nav-label text-muted">{formatDate(p.date)}</p>
              <Link
                href={`/news/${p.slug}`}
                className="mt-1 block text-lg text-ink hover:underline"
              >
                {p.title}
              </Link>
              {p.excerpt && (
                <p className="mt-1 text-ink/75">{p.excerpt}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
