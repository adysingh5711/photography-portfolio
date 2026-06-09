"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SmartImage } from "@/components/SmartImage";
import type { Id } from "@/convex/_generated/dataModel";

type ManagedImage = {
  _id: Id<"images">;
  url: string | null;
  alt: string;
  width?: number;
  height?: number;
  order: number;
};

function naturalSize(src: string): Promise<{ w?: number; h?: number }> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => resolve({});
    img.src = src;
  });
}

export function ImageManager({
  galleryId,
  images,
  coverImageId,
}: {
  galleryId: Id<"galleries">;
  images: ManagedImage[];
  coverImageId?: Id<"images">;
}) {
  const generateUploadUrl = useMutation(api.images.generateUploadUrl);
  const addImage = useMutation(api.images.addImage);
  const updateImage = useMutation(api.images.updateImage);
  const removeImage = useMutation(api.images.removeImage);
  const reorder = useMutation(api.images.reorder);
  const setCover = useMutation(api.galleries.update);

  const [busy, setBusy] = useState(false);
  const [externalUrl, setExternalUrl] = useState("");

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        const objectUrl = URL.createObjectURL(file);
        const { w, h } = await naturalSize(objectUrl);
        URL.revokeObjectURL(objectUrl);
        const postUrl = await generateUploadUrl();
        const res = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = await res.json();
        await addImage({ galleryId, storageId, width: w, height: h, alt: "" });
      }
    } finally {
      setBusy(false);
    }
  }

  async function addByUrl() {
    const url = externalUrl.trim();
    if (!url) return;
    setBusy(true);
    try {
      const { w, h } = await naturalSize(url);
      await addImage({ galleryId, externalUrl: url, width: w, height: h, alt: "" });
      setExternalUrl("");
    } finally {
      setBusy(false);
    }
  }

  function move(index: number, dir: -1 | 1) {
    const ids = images.map((i) => i._id);
    const j = index + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[index], ids[j]] = [ids[j], ids[index]];
    reorder({ orderedIds: ids });
  }

  return (
    <div>
      <h2 className="nav-label text-muted">Images</h2>

      {/* Upload controls */}
      <div className="mt-3 flex flex-wrap items-center gap-4 border border-faint p-4">
        <label className="cursor-pointer bg-ink px-3 py-2 text-sm text-ground">
          {busy ? "Uploading…" : "Upload images"}
          <input
            type="file"
            accept="image/*"
            multiple
            hidden
            disabled={busy}
            onChange={(e) => uploadFiles(e.target.files)}
          />
        </label>
        <span className="text-sm text-muted">or</span>
        <div className="flex items-center gap-2">
          <input
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            placeholder="Paste image URL"
            className="w-64 border border-faint px-2 py-1.5 text-sm outline-none focus:border-ink"
          />
          <button
            onClick={addByUrl}
            disabled={busy}
            className="border border-ink px-3 py-1.5 text-sm text-ink disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>

      {/* Image grid */}
      <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {images.map((img, i) => (
          <li key={img._id} className="border border-faint p-2">
            <div className="relative aspect-square overflow-hidden bg-faint">
              <SmartImage url={img.url} alt={img.alt} fill className="object-cover" sizes="200px" />
              {coverImageId === img._id && (
                <span className="absolute left-1 top-1 bg-ink px-1.5 py-0.5 text-[0.6rem] uppercase tracking-wide text-ground">
                  Cover
                </span>
              )}
            </div>
            <input
              defaultValue={img.alt}
              placeholder="Alt text"
              onBlur={(e) =>
                updateImage({ id: img._id, alt: e.target.value })
              }
              className="mt-2 w-full border border-faint px-1.5 py-1 text-xs outline-none focus:border-ink"
            />
            <div className="mt-1.5 flex items-center justify-between text-[0.7rem] text-muted">
              <div className="flex gap-1.5">
                <button onClick={() => move(i, -1)} className="hover:text-ink" aria-label="Move left">
                  ◀
                </button>
                <button onClick={() => move(i, 1)} className="hover:text-ink" aria-label="Move right">
                  ▶
                </button>
              </div>
              <button
                onClick={() => setCover({ id: galleryId, coverImageId: img._id })}
                className="hover:text-ink"
              >
                Set cover
              </button>
              <button
                onClick={() => removeImage({ id: img._id })}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      {images.length === 0 && (
        <p className="mt-4 text-sm text-muted">No images yet.</p>
      )}
    </div>
  );
}
