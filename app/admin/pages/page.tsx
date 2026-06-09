"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const field =
  "mt-1 w-full border border-faint px-2 py-1.5 text-sm outline-none focus:border-ink";

function SaveBar({ onSave }: { onSave: () => Promise<unknown> }) {
  const [saved, setSaved] = useState(false);
  return (
    <div className="mt-3 flex items-center gap-3">
      <button
        onClick={async () => {
          await onSave();
          setSaved(true);
          setTimeout(() => setSaved(false), 1500);
        }}
        className="bg-ink px-3 py-2 text-sm text-ground"
      >
        Save
      </button>
      {saved && <span className="text-sm text-muted">Saved</span>}
    </div>
  );
}

function SettingsForm() {
  const data = useQuery(api.pages.get, { key: "settings" }) as
    | { siteTitle?: string; tagline?: string }
    | null
    | undefined;
  const upsert = useMutation(api.pages.upsert);
  const [form, setForm] = useState({ siteTitle: "", tagline: "" });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (data !== undefined && !loaded) {
      setForm({ siteTitle: data?.siteTitle ?? "", tagline: data?.tagline ?? "" });
      setLoaded(true);
    }
  }, [data, loaded]);

  return (
    <section>
      <h2 className="text-lg text-ink">Site settings</h2>
      <div className="mt-3 grid max-w-md gap-3">
        <label className="text-sm">
          <span className="nav-label text-muted">Site title</span>
          <input
            value={form.siteTitle}
            onChange={(e) => setForm({ ...form, siteTitle: e.target.value })}
            className={field}
          />
        </label>
        <label className="text-sm">
          <span className="nav-label text-muted">Tagline</span>
          <input
            value={form.tagline}
            onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            className={field}
          />
        </label>
      </div>
      <SaveBar onSave={() => upsert({ key: "settings", content: form })} />
    </section>
  );
}

function ContactForm() {
  const data = useQuery(api.pages.get, { key: "contact" }) as
    | Record<string, string>
    | null
    | undefined;
  const upsert = useMutation(api.pages.upsert);
  const [form, setForm] = useState({
    email: "",
    phone: "",
    instagram: "",
    representation: "",
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (data !== undefined && !loaded) {
      setForm({
        email: data?.email ?? "",
        phone: data?.phone ?? "",
        instagram: data?.instagram ?? "",
        representation: data?.representation ?? "",
      });
      setLoaded(true);
    }
  }, [data, loaded]);

  return (
    <section>
      <h2 className="text-lg text-ink">Contact</h2>
      <div className="mt-3 grid max-w-md gap-3">
        {(["email", "phone", "instagram"] as const).map((k) => (
          <label key={k} className="text-sm">
            <span className="nav-label text-muted">{k}</span>
            <input
              value={form[k]}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })}
              className={field}
            />
          </label>
        ))}
        <label className="text-sm">
          <span className="nav-label text-muted">Representation</span>
          <textarea
            value={form.representation}
            onChange={(e) =>
              setForm({ ...form, representation: e.target.value })
            }
            rows={3}
            className={field}
          />
        </label>
      </div>
      <SaveBar onSave={() => upsert({ key: "contact", content: form })} />
    </section>
  );
}

const BIO_LISTS = [
  ["soloExhibitions", "Solo exhibitions"],
  ["groupExhibitions", "Group exhibitions"],
  ["awards", "Awards & grants"],
  ["collections", "Collections"],
  ["publications", "Publications"],
] as const;

function BioForm() {
  const data = useQuery(api.pages.get, { key: "bio" }) as
    | Record<string, unknown>
    | null
    | undefined;
  const upsert = useMutation(api.pages.upsert);
  const [statement, setStatement] = useState("");
  const [lists, setLists] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (data !== undefined && !loaded) {
      setStatement((data?.statement as string) ?? "");
      const next: Record<string, string> = {};
      for (const [key] of BIO_LISTS) {
        const arr = (data?.[key] as string[] | undefined) ?? [];
        next[key] = arr.join("\n");
      }
      setLists(next);
      setLoaded(true);
    }
  }, [data, loaded]);

  async function save() {
    const content: Record<string, unknown> = { statement };
    for (const [key] of BIO_LISTS) {
      content[key] = (lists[key] ?? "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    await upsert({ key: "bio", content });
  }

  return (
    <section>
      <h2 className="text-lg text-ink">Biography</h2>
      <div className="mt-3 grid max-w-2xl gap-3">
        <label className="text-sm">
          <span className="nav-label text-muted">Statement</span>
          <textarea
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            rows={5}
            className={field}
          />
        </label>
        {BIO_LISTS.map(([key, label]) => (
          <label key={key} className="text-sm">
            <span className="nav-label text-muted">{label} (one per line)</span>
            <textarea
              value={lists[key] ?? ""}
              onChange={(e) => setLists({ ...lists, [key]: e.target.value })}
              rows={4}
              className={field}
            />
          </label>
        ))}
      </div>
      <SaveBar onSave={save} />
    </section>
  );
}

export default function AdminPages() {
  return (
    <div>
      <h1 className="text-xl tracking-wide text-ink">Pages</h1>
      <div className="mt-6 grid gap-12">
        <SettingsForm />
        <BioForm />
        <ContactForm />
      </div>
    </div>
  );
}
