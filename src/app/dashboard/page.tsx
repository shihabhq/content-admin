"use client";

import Link from "next/link";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-stone-900">Overview</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/dashboard/videos"
          className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm transition hover:border-amber-200 hover:shadow"
        >
          <h2 className="text-lg font-medium text-stone-900">Videos</h2>
          <p className="mt-1 text-sm text-stone-500">Add, edit, and delete videos.</p>
        </Link>
        <Link
          href="/dashboard/artworks"
          className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm transition hover:border-amber-200 hover:shadow"
        >
          <h2 className="text-lg font-medium text-stone-900">Artworks</h2>
          <p className="mt-1 text-sm text-stone-500">Manage artwork and images.</p>
        </Link>
        <Link
          href="/dashboard/tags"
          className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm transition hover:border-amber-200 hover:shadow"
        >
          <h2 className="text-lg font-medium text-stone-900">Tags</h2>
          <p className="mt-1 text-sm text-stone-500">Create and manage tags for content.</p>
        </Link>
      </div>
    </div>
  );
}
