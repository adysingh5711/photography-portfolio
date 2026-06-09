"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SmartImage } from "@/components/SmartImage";

const SECTION_OPTIONS = [
  { value: "project", label: "Project" },
  { value: "story", label: "Story" },
  { value: "publication", label: "Publication" },
  { value: "commission", label: "Commission" },
  { value: "portfolio", label: "Portfolio" },
] as const;

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminGalleries() {
  const router = useRouter();
  const galleries = useQuery(api.galleries.listAll);
  const create = useMutation(api.galleries.create);
  const update = useMutation(api.galleries.update);
  const remove = useMutation(api.galleries.remove);
  const reorder = useMutation(api.galleries.reorder);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [section, setSection] =
    useState<(typeof SECTION_OPTIONS)[number]["value"]>("project");
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      const id = await create({
        section,
        title,
        slug: slug || slugify(title),
      });
      router.push(`/admin/galleries/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create gallery.");
      setCreating(false);
    }
  }

  function move(index: number, dir: -1 | 1) {
    if (!galleries) return;
    const ids = galleries.map((g) => g._id);
    const j = index + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[index], ids[j]] = [ids[j], ids[index]];
    reorder({ orderedIds: ids });
  }

  return (
    <div>
      <h1 className="text-xl tracking-wide text-ink">Galleries</h1>

      {/* Create */}
      <form
        onSubmit={onCreate}
        className="mt-6 flex flex-wrap items-end gap-3 border border-faint p-4"
      >
        <label className="flex flex-col text-sm">
          <span className="nav-label text-muted">Title</span>
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setSlug(slugify(e.target.value));
            }}
            required
            className="mt-1 border border-faint px-2 py-1.5 outline-none focus:border-ink"
          />
        </label>
        <label className="flex flex-col text-sm">
          <span className="nav-label text-muted">Slug</span>
          <input
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            className="mt-1 border border-faint px-2 py-1.5 outline-none focus:border-ink"
          />
        </label>
        <label className="flex flex-col text-sm">
          <span className="nav-label text-muted">Section</span>
          <select
            value={section}
            onChange={(e) => setSection(e.target.value as typeof section)}
            className="mt-1 border border-faint px-2 py-1.5 outline-none focus:border-ink"
          >
            {SECTION_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          disabled={creating}
          className="bg-ink px-3 py-2 text-sm text-ground disabled:opacity-50"
        >
          {creating ? "…" : "Add gallery"}
        </button>
        {error && <p className="w-full text-sm text-red-600">{error}</p>}
      </form>

      {/* List */}
      <ul className="mt-6 divide-y divide-faint border-y border-faint">
        {(galleries ?? []).map((g, i) => (
          <li key={g._id} className="flex items-center gap-4 py-3">
            <div className="relative h-14 w-12 shrink-0 overflow-hidden bg-faint">
              <SmartImage url={g.coverUrl} alt={g.title} fill className="object-cover" sizes="48px" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-ink">{g.title}</div>
              <div className="nav-label text-muted">
                {g.section} · /{g.slug}
                {!g.published && " · draft"}
                {g.isFeatured && " · featured"}
              </div>
            </div>
            <button
              onClick={() => update({ id: g._id, published: !g.published })}
              className="nav-label text-muted hover:text-ink"
              title="Toggle published"
            >
              {g.published ? "Unpublish" : "Publish"}
            </button>
            <div className="flex flex-col text-muted">
              <button onClick={() => move(i, -1)} aria-label="Move up" className="hover:text-ink">
                ▲
              </button>
              <button onClick={() => move(i, 1)} aria-label="Move down" className="hover:text-ink">
                ▼
              </button>
            </div>
            <Link
              href={`/admin/galleries/${g._id}`}
              className="text-sm text-ink underline"
            >
              Edit
            </Link>
            <button
              onClick={() => {
                if (confirm(`Delete "${g.title}" and all its images?`)) {
                  remove({ id: g._id });
                }
              }}
              className="text-sm text-red-600 hover:underline"
            >
              Delete
            </button>
          </li>
        ))}
        {galleries !== undefined && galleries.length === 0 && (
          <li className="py-6 text-muted">No galleries yet.</li>
        )}
      </ul>
    </div>
  );
}
