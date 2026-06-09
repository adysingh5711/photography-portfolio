"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function NewsRow({ post }: { post: Doc<"news"> }) {
  const update = useMutation(api.news.update);
  const remove = useMutation(api.news.remove);
  const [form, setForm] = useState({
    title: post.title,
    date: post.date,
    excerpt: post.excerpt ?? "",
    body: post.body,
    published: post.published,
  });
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const field = "mt-1 w-full border border-faint px-2 py-1.5 text-sm outline-none focus:border-ink";

  return (
    <li className="py-3">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setOpen((v) => !v)}
          className="min-w-0 flex-1 text-left"
        >
          <span className="truncate text-ink">{form.title}</span>{" "}
          <span className="nav-label text-muted">
            · {post.date}
            {!post.published && " · draft"}
          </span>
        </button>
        <button
          onClick={() =>
            update({ id: post._id, published: !form.published }).then(() =>
              setForm({ ...form, published: !form.published }),
            )
          }
          className="nav-label text-muted hover:text-ink"
        >
          {form.published ? "Unpublish" : "Publish"}
        </button>
        <button
          onClick={() => {
            if (confirm(`Delete "${form.title}"?`)) remove({ id: post._id });
          }}
          className="text-sm text-red-600 hover:underline"
        >
          Delete
        </button>
      </div>

      {open && (
        <div className="mt-3 grid max-w-2xl gap-3">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={field}
            placeholder="Title"
          />
          <input
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className={field}
            placeholder="YYYY-MM-DD"
          />
          <input
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            className={field}
            placeholder="Excerpt"
          />
          <textarea
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            rows={5}
            className={field}
            placeholder="Body"
          />
          <div>
            <button
              onClick={() =>
                update({ id: post._id, ...form }).then(() => {
                  setSaved(true);
                  setTimeout(() => setSaved(false), 1500);
                })
              }
              className="bg-ink px-3 py-2 text-sm text-ground"
            >
              Save
            </button>
            {saved && <span className="ml-3 text-sm text-muted">Saved</span>}
          </div>
        </div>
      )}
    </li>
  );
}

export default function AdminNews() {
  const posts = useQuery(api.news.listAll);
  const create = useMutation(api.news.create);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const field = "mt-1 border border-faint px-2 py-1.5 text-sm outline-none focus:border-ink";

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await create({
        title,
        slug: slugify(title),
        date: date || new Date().toISOString().slice(0, 10),
        body: "",
        published: false,
      });
      setTitle("");
      setDate("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create post.");
    }
  }

  return (
    <div>
      <h1 className="text-xl tracking-wide text-ink">News</h1>

      <form
        onSubmit={onCreate}
        className="mt-6 flex flex-wrap items-end gap-3 border border-faint p-4"
      >
        <label className="flex flex-col text-sm">
          <span className="nav-label text-muted">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className={field}
          />
        </label>
        <label className="flex flex-col text-sm">
          <span className="nav-label text-muted">Date</span>
          <input
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder="YYYY-MM-DD"
            className={field}
          />
        </label>
        <button type="submit" className="bg-ink px-3 py-2 text-sm text-ground">
          Add post
        </button>
        {error && <p className="w-full text-sm text-red-600">{error}</p>}
      </form>

      <ul className="mt-6 divide-y divide-faint border-y border-faint">
        {(posts ?? []).map((p) => (
          <NewsRow key={p._id} post={p} />
        ))}
        {posts !== undefined && posts.length === 0 && (
          <li className="py-6 text-muted">No posts yet.</li>
        )}
      </ul>
    </div>
  );
}
