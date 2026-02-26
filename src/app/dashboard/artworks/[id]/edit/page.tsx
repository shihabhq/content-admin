"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import {
  fetchArtwork,
  updateArtwork,
  resolveTagNamesToIds,
  type Artwork,
  type ApiError,
} from "@/lib/api";
import { TagsInput } from "@/components/tags-input";
import { inputClass } from "@/lib/admin-input";

function getErrorMessage(err: ApiError): string {
  if (err.message) return err.message;
  const e = err.error;
  if (e && typeof e === "object") {
    const flat = (e as { fieldErrors?: Record<string, string[]> }).fieldErrors;
    if (flat) {
      const first = Object.values(flat).flat()[0];
      if (first) return first;
    }
    if ("message" in e) return String((e as { message: string }).message);
  }
  return "Something went wrong";
}

export default function EditArtworkPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsString, setTagsString] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    fetchArtwork(token, id).then((artworkRes) => {
      if (artworkRes.data) {
        setArtwork(artworkRes.data);
        setTitle(artworkRes.data.title);
        setContent(artworkRes.data.content ?? "");
        setIsFeatured(artworkRes.data.isFeatured);
        setIsPublished(artworkRes.data.isPublished);
        setTagsString(
          artworkRes.data.tags?.map((t) => t.tag.name).join(", ") ?? ""
        );
      }
      setLoading(false);
    });
  }, [token, id]);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!token || !id) return;
      setError("");
      setSubmitting(true);
      const names = tagsString.split(",").map((s) => s.trim()).filter(Boolean);
      const { data: tagIds, error: tagErr } = await resolveTagNamesToIds(token, names);
      if (tagErr) {
        setSubmitting(false);
        setError(getErrorMessage(tagErr));
        return;
      }
      const { data, error: err } = await updateArtwork(token, id, {
        title,
        content,
        isFeatured,
        isPublished,
        tagIds: tagIds ?? [],
        image: imageFile ?? undefined,
      });
      setSubmitting(false);
      if (err) {
        setError(getErrorMessage(err));
        return;
      }
      if (data) router.push("/dashboard/artworks");
    },
    [token, id, title, content, tagsString, isFeatured, isPublished, imageFile, router]
  );

  if (loading) return <p className="text-stone-500">Loading…</p>;
  if (!artwork) return <p className="text-stone-500">Artwork not found.</p>;

  const currentImage = imagePreview ?? artwork.imageUrl;

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/dashboard/artworks"
          className="text-sm text-stone-500 hover:text-stone-700"
        >
          ← Artworks
        </Link>
      </div>
      <h1 className="mb-6 text-2xl font-semibold text-stone-900">Edit artwork</h1>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={200}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Image</label>
          <p className="mb-1 text-xs text-stone-500">Leave empty to keep current image.</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="w-full rounded-lg border border-stone-400 bg-white px-3 py-2 text-sm text-stone-900 file:mr-2 file:rounded file:border-0 file:border-stone-300 file:bg-amber-50 file:px-3 file:py-1 file:text-amber-800"
          />
          {currentImage && (
            <div className="mt-2 h-40 w-64 overflow-hidden rounded-lg border border-stone-200">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="New preview"
                  className="h-full w-full object-contain"
                />
              ) : (
                <img
                  src={artwork.imageUrl}
                  alt=""
                  width={256}
                  height={160}
                  className="h-full w-full object-contain"
                />
              )}
            </div>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Content / description</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Tags</label>
          <p className="mb-1 text-xs text-stone-500">Comma-separated; used for recommendations on the frontend.</p>
          <TagsInput value={tagsString} onChange={setTagsString} />
        </div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="size-4 rounded border-stone-400 text-amber-600 focus:ring-amber-500"
            />
            <span className="text-sm font-medium text-stone-800">Featured</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="size-4 rounded border-stone-400 text-amber-600 focus:ring-amber-500"
            />
            <span className="text-sm font-medium text-stone-800">Published</span>
          </label>
        </div>
        <div className="flex gap-2 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Save"}
          </button>
          <Link
            href="/dashboard/artworks"
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
