"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

type Contact = {
  email?: string;
  phone?: string;
  instagram?: string;
  representation?: string;
};

export function ContactView() {
  const contact = useQuery(api.pages.get, { key: "contact" }) as
    | Contact
    | null
    | undefined;

  if (contact === undefined) {
    return <div className="h-40 animate-pulse bg-faint" />;
  }

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-xl tracking-wide text-ink">Contact</h1>
      <dl className="space-y-3 text-ink/90">
        {contact?.email && (
          <div>
            <dt className="nav-label text-muted">Email</dt>
            <dd>
              <a className="hover:underline" href={`mailto:${contact.email}`}>
                {contact.email}
              </a>
            </dd>
          </div>
        )}
        {contact?.phone && (
          <div>
            <dt className="nav-label text-muted">Phone</dt>
            <dd>{contact.phone}</dd>
          </div>
        )}
        {contact?.instagram && (
          <div>
            <dt className="nav-label text-muted">Instagram</dt>
            <dd>
              <a
                className="hover:underline"
                href={`https://instagram.com/${contact.instagram}`}
                target="_blank"
                rel="noreferrer"
              >
                @{contact.instagram}
              </a>
            </dd>
          </div>
        )}
      </dl>
      {contact?.representation && (
        <p className="mt-6 text-ink/80">{contact.representation}</p>
      )}
    </div>
  );
}
