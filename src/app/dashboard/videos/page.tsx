"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import {
  deleteVideo,
  fetchVideos,
  type Video,
  type ApiError,
} from "@/lib/api";
import { ConfirmDialog } from "@/components/confirm-dialog";

const PAGE_SIZE = 20;

function getErrorMessage(err: ApiError): string {
  if (err.message) return err.message;
  const e = err.error;
  if (e && typeof e === "object" && "message" in e) return String((e as { message: string }).message);
  return "Something went wrong";
}

export default function VideosPage() {
  const { token } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(
    async (p = 1) => {
      if (!token) return;
      setLoading(true);
      setError("");
      const { data, error: err } = await fetchVideos(token, p, PAGE_SIZE);
      setLoading(false);
      if (err) {
        setError(getErrorMessage(err));
        return;
      }
      if (data) {
        setVideos(data.data);
        setTotal(data.total);
        setPage(data.page);
      }
    },
    [token]
  );

  useEffect(() => {
    queueMicrotask(() => load(page));
  }, [load, page]);

  async function handleDelete() {
    if (!deleteId || !token) return;
    setDeleting(true);
    const { error: err } = await deleteVideo(token, deleteId);
    setDeleting(false);
    if (err) {
      setError(getErrorMessage(err));
      setDeleteId(null);
      return;
    }
    setDeleteId(null);
    load(page);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-stone-900">Videos</h1>
        <Link
          href="/dashboard/videos/new"
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
        >
          Add video
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-stone-500">Loading videos…</p>
      ) : videos.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-white p-8 text-center text-stone-500">
          No videos yet.{" "}
          <Link href="/dashboard/videos/new" className="text-amber-600 hover:underline">
            Add one
          </Link>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50">
                  <th className="px-4 py-3 font-medium text-stone-700">Title</th>
                  <th className="px-4 py-3 font-medium text-stone-700">Tags</th>
                  <th className="px-4 py-3 font-medium text-stone-700">Featured</th>
                  <th className="px-4 py-3 font-medium text-stone-700">Recommended</th>
                  <th className="px-4 py-3 font-medium text-stone-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {videos.map((v) => (
                  <tr key={v.id} className="border-b border-stone-100 hover:bg-stone-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/videos/${v.id}/edit`}
                        className="font-medium text-stone-900 hover:text-amber-600"
                      >
                        {v.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-stone-600">
                        {v.tags?.map((t) => t.tag.name).join(", ") || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">{v.isFeatured ? "Yes" : "No"}</td>
                    <td className="px-4 py-3">{v.isRecommended ? "Yes" : "No"}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/videos/${v.id}/edit`}
                        className="mr-3 text-amber-600 hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteId(v.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded border border-stone-300 px-3 py-1 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-stone-600">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded border border-stone-300 px-3 py-1 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete video"
        message="Are you sure you want to delete this video? This cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  );
}
