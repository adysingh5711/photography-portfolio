"use client";

import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

export default function AdminDashboard() {
  const galleries = useQuery(api.galleries.listAll);
  const news = useQuery(api.news.listAll);
  const seed = useMutation(api.seed.run);
  const [msg, setMsg] = useState<string | null>(null);

  const counts = [
    { label: "Galleries", value: galleries?.length, href: "/admin/galleries" },
    { label: "News posts", value: news?.length, href: "/admin/news" },
  ];

  return (
    <div>
      <h1 className="text-xl tracking-wide text-ink">Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {counts.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="border border-faint p-5 hover:border-ink"
          >
            <div className="text-3xl text-ink">{c.value ?? "—"}</div>
            <div className="nav-label text-muted">{c.label}</div>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link href="/admin/galleries" className="bg-ink px-3 py-2 text-ground">
          Manage galleries
        </Link>
        <Link
          href="/admin/pages"
          className="border border-ink px-3 py-2 text-ink"
        >
          Edit biography & contact
        </Link>
      </div>

      {galleries !== undefined && galleries.length === 0 && (
        <div className="mt-10 border border-faint p-5">
          <p className="text-ink">No content yet.</p>
          <p className="mt-1 text-sm text-muted">
            Load the placeholder galleries, bio and news that mirror the original
            site structure. You can edit or replace everything afterwards.
          </p>
          <button
            className="mt-3 bg-ink px-3 py-2 text-sm text-ground"
            onClick={async () => {
              const res = await seed({});
              setMsg(
                res.skipped
                  ? res.message ?? "Already seeded."
                  : `Seeded ${res.galleries} galleries and ${res.news} news posts.`,
              );
            }}
          >
            Load demo content
          </button>
          {msg && <p className="mt-2 text-sm text-muted">{msg}</p>}
        </div>
      )}
    </div>
  );
}
