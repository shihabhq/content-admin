"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import {
  fetchVideos,
  updateVideo,
  deleteVideo,
  type Video,
  type ApiError,
} from "@/lib/api";
import { ConfirmDialog } from "@/components/confirm-dialog";

const PAGE_SIZE = 20;

function getErrorMessage(err: ApiError): string {
  if (err.message) return err.message;
  const e = err.error;
  if (e && typeof e === "object" && "message" in e) {
    return String((e as { message: string }).message);
  }
  return "Something went wrong";
}

export default function SubmissionsPage() {
  const { token } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approveId, setApproveId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(
    async (p = 1) => {
      if (!token) return;
      setLoading(true);
      setError("");
      const { data, error: err } = await fetchVideos(
        token,
        p,
        PAGE_SIZE,
        "PENDING",
      );
      setLoading(false);
      if (err) {
        setError(getErrorMessage(err));
        return;
      }
      if (data) {
        // Extra safety: only keep videos that are actually pending.
        const pending = (data.data ?? []).filter(
          (v) => v.status === "PENDING",
        );
        setVideos(pending);
        setTotal(pending.length);
        setPage(data.page);
      }
    },
    [token],
  );

  useEffect(() => {
    queueMicrotask(() => load(page));
  }, [load, page]);

  async function handleApprove() {
    if (!approveId || !token) return;
    setSubmitting(true);
    const { error: err } = await updateVideo(token, approveId, {
      status: "PUBLISHED",
    });
    setSubmitting(false);
    if (err) {
      setError(getErrorMessage(err));
      setApproveId(null);
      return;
    }
    setApproveId(null);
    load(page);
  }

  async function handleReject() {
    if (!rejectId || !token) return;
    setSubmitting(true);
    // For now, "reject" means deleting the pending submission.
    const { error: err } = await deleteVideo(token, rejectId);
    setSubmitting(false);
    if (err) {
      setError(getErrorMessage(err));
      setRejectId(null);
      return;
    }
    setRejectId(null);
    load(page);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-stone-900">Submissions</h1>
        <Link
          href="/dashboard/videos"
          className="text-sm text-stone-500 hover:text-stone-700"
        >
          ← Back to videos
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-stone-500">Loading submissions…</p>
      ) : videos.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-white p-8 text-center text-stone-500">
          No pending submissions.
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50">
                  <th className="px-4 py-3 font-medium text-stone-700">
                    Title
                  </th>
                  <th className="px-4 py-3 font-medium text-stone-700">
                    Creator
                  </th>
                  <th className="px-4 py-3 font-medium text-stone-700">
                    Submitted at
                  </th>
                  <th className="px-4 py-3 font-medium text-stone-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {videos.map((v) => (
                  <tr
                    key={v.id}
                    className="border-b border-stone-100 hover:bg-stone-50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/videos/${v.id}/edit`}
                        className="font-medium text-stone-900 hover:text-amber-600"
                      >
                        {v.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {v.creatorName || "—"}
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {new Date(v.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setApproveId(v.id)}
                        className="mr-3 text-emerald-700 hover:underline"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => setRejectId(v.id)}
                        className="text-red-600 hover:underline"
                      >
                        Reject
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
        open={!!approveId}
        title="Accept submission"
        message="Accepting this submission will publish the video on the public site."
        confirmLabel="Accept"
        onConfirm={handleApprove}
        onCancel={() => setApproveId(null)}
        loading={submitting}
      />

      <ConfirmDialog
        open={!!rejectId}
        title="Reject submission"
        message="Rejecting this submission will remove it from the queue. This cannot be undone."
        confirmLabel="Reject"
        danger
        onConfirm={handleReject}
        onCancel={() => setRejectId(null)}
        loading={submitting}
      />
    </div>
  );
}

