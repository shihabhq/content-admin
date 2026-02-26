"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import {
  fetchVideo,
  updateVideo,
  resolveTagNamesToIds,
  type Video,
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

export default function EditVideoPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const router = useRouter();
  const [video, setVideo] = useState<Video | null>(null);
  const [title, setTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [description, setDescription] = useState("");
  const [tagsString, setTagsString] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isRecommended, setIsRecommended] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    fetchVideo(token, id).then((videoRes) => {
      if (videoRes.data) {
        setVideo(videoRes.data);
        setTitle(videoRes.data.title);
        setYoutubeUrl(videoRes.data.youtubeUrl);
        setDescription(videoRes.data.description ?? "");
        setIsFeatured(videoRes.data.isFeatured);
        setIsRecommended(videoRes.data.isRecommended);
        setTagsString(
          videoRes.data.tags?.map((t) => t.tag.name).join(", ") ?? ""
        );
      }
      setLoading(false);
    });
  }, [token, id]);

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
      const { data, error: err } = await updateVideo(token, id, {
        title,
        youtubeUrl,
        description: description || undefined,
        isFeatured,
        isRecommended,
        tagIds: tagIds ?? [],
      });
      setSubmitting(false);
      if (err) {
        setError(getErrorMessage(err));
        return;
      }
      if (data) router.push("/dashboard/videos");
    },
    [token, id, title, youtubeUrl, description, tagsString, isFeatured, isRecommended, router]
  );

  if (loading) return <p className="text-stone-500">Loading…</p>;
  if (!video) return <p className="text-stone-500">Video not found.</p>;

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/dashboard/videos"
          className="text-sm text-stone-500 hover:text-stone-700"
        >
          ← Videos
        </Link>
      </div>
      <h1 className="mb-6 text-2xl font-semibold text-stone-900">Edit video</h1>

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
          <label className="mb-1 block text-sm font-medium text-stone-700">YouTube URL *</label>
          <input
            type="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
              checked={isRecommended}
              onChange={(e) => setIsRecommended(e.target.checked)}
              className="size-4 rounded border-stone-400 text-amber-600 focus:ring-amber-500"
            />
            <span className="text-sm font-medium text-stone-800">Recommended</span>
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
            href="/dashboard/videos"
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
