"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SmartImage } from "./SmartImage";

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

export function NewsPost({ slug }: { slug: string }) {
  const post = useQuery(api.news.getBySlug, { slug });

  if (post === undefined) {
    return <div className="h-64 animate-pulse bg-faint" />;
  }
  if (post === null) {
    return <p className="text-muted">This post could not be found.</p>;
  }

  return (
    <article className="max-w-2xl">
      <p className="nav-label text-muted">{formatDate(post.date)}</p>
      <h1 className="mt-2 text-2xl tracking-wide text-ink">{post.title}</h1>
      {post.coverUrl && (
        <div className="mt-6">
          <SmartImage
            url={post.coverUrl}
            alt={post.title}
            sizes="(max-width: 768px) 100vw, 640px"
            className="h-auto w-full"
          />
        </div>
      )}
      <div className="mt-6 whitespace-pre-line text-ink/90">{post.body}</div>
    </article>
  );
}
