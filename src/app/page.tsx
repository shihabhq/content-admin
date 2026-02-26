"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

export default function Home() {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (session) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [session, loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100">
      <p className="text-stone-500">Loading…</p>
    </div>
  );
}
