"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

type Bio = {
  statement?: string;
  soloExhibitions?: string[];
  groupExhibitions?: string[];
  awards?: string[];
  collections?: string[];
  publications?: string[];
};

function Section({ label, items }: { label: string; items?: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <section className="mt-8">
      <h2 className="nav-label text-muted">{label}</h2>
      <ul className="mt-2 space-y-1 text-ink/90">
        {items.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
    </section>
  );
}

export function BioView() {
  const bio = useQuery(api.pages.get, { key: "bio" }) as
    | Bio
    | null
    | undefined;

  if (bio === undefined) {
    return <div className="h-64 animate-pulse bg-faint" />;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-xl tracking-wide text-ink">Biography</h1>
      {bio?.statement && (
        <p className="whitespace-pre-line text-ink/90">{bio.statement}</p>
      )}
      <Section label="Solo Exhibitions" items={bio?.soloExhibitions} />
      <Section label="Group Exhibitions" items={bio?.groupExhibitions} />
      <Section label="Awards & Grants" items={bio?.awards} />
      <Section label="Collections" items={bio?.collections} />
      <Section label="Publications" items={bio?.publications} />
    </div>
  );
}
