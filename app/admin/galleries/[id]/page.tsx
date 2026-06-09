"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ImageManager } from "@/components/admin/ImageManager";

const SECTION_OPTIONS = [
  "project",
  "story",
  "publication",
  "commission",
  "portfolio",
] as const;

type Section = (typeof SECTION_OPTIONS)[number];

export default function GalleryEditor() {
  const params = useParams<{ id: string }>();
  const id = params.id as Id<"galleries">;
  const gallery = useQuery(api.galleries.getById, { id });
  const update = useMutation(api.galleries.update);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    subtitle: "",
    statement: "",
    section: "project" as Section,
    published: true,
    isFeatured: false,
  });
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (gallery && gallery._id !== loadedId) {
      setForm({
        title: gallery.title,
        slug: gallery.slug,
        subtitle: gallery.subtitle ?? "",
        statement: gallery.statement ?? "",
        section: gallery.section as Section,
        published: gallery.published,
        isFeatured: gallery.isFeatured ?? false,
      });
      setLoadedId(gallery._id);
    }
  }, [gallery, loadedId]);

  if (gallery === undefined) {
    return <div className="h-64 animate-pulse bg-faint" />;
  }
  if (gallery === null) {
    return (
      <div>
        <p className="text-muted">Gallery not found.</p>
        <Link href="/admin/galleries" className="text-ink underline">
          Back to galleries
        </Link>
      </div>
    );
  }

  async function save() {
    await update({ id, ...form });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  const field = "mt-1 w-full border border-faint px-2 py-1.5 outline-none focus:border-ink";

  return (
    <div>
      <div className="flex items-center justify-between">
        <Link href="/admin/galleries" className="nav-label text-muted hover:text-ink">
          ← Galleries
        </Link>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-muted">Saved</span>}
          <button onClick={save} className="bg-ink px-3 py-2 text-sm text-ground">
            Save
          </button>
        </div>
      </div>

      <h1 className="mt-4 text-xl tracking-wide text-ink">{form.title || "Untitled"}</h1>

      <div className="mt-6 grid max-w-2xl gap-4">
        <label className="text-sm">
          <span className="nav-label text-muted">Title</span>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={field}
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="text-sm">
            <span className="nav-label text-muted">Slug</span>
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className={field}
            />
          </label>
          <label className="text-sm">
            <span className="nav-label text-muted">Section</span>
            <select
              value={form.section}
              onChange={(e) =>
                setForm({ ...form, section: e.target.value as Section })
              }
              className={field}
            >
              {SECTION_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="text-sm">
          <span className="nav-label text-muted">Subtitle</span>
          <input
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            className={field}
          />
        </label>
        <label className="text-sm">
          <span className="nav-label text-muted">Statement</span>
          <textarea
            value={form.statement}
            onChange={(e) => setForm({ ...form, statement: e.target.value })}
            rows={5}
            className={field}
          />
        </label>
        <div className="flex gap-6 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
            />
            Published
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) =>
                setForm({ ...form, isFeatured: e.target.checked })
              }
            />
            Featured on Home
          </label>
        </div>
      </div>

      <hr className="my-8 border-faint" />

      <ImageManager
        galleryId={id}
        images={gallery.images}
        coverImageId={gallery.coverImageId}
      />
    </div>
  );
}
