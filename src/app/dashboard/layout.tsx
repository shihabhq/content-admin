"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";

const nav = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/videos", label: "Videos" },
  { href: "/dashboard/artworks", label: "Artworks" },
  { href: "/dashboard/tags", label: "Tags" },
];

export default function DashboardLayout({
  children,
}: { children: React.ReactNode }) {
  const { session, loading, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname || "/dashboard")}`);
    }
  }, [session, loading, router, pathname]);

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-100">
        <p className="text-stone-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-stone-100">
      <aside className="flex w-56 shrink-0 flex-col border-r border-stone-200 bg-white">
        <div className="flex h-14 items-center border-b border-stone-200 px-4">
          <Link href="/dashboard" className="font-semibold text-stone-900">
            Content Admin
          </Link>
        </div>
        <nav className="flex flex-col gap-0.5 p-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                pathname === item.href
                  ? "bg-amber-50 text-amber-800"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-stone-200 p-2">
          <button
            type="button"
            onClick={() => signOut().then(() => router.push("/login"))}
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-stone-600 hover:bg-stone-100"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
