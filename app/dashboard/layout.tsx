"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-gold" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen bg-surface">
      {/* Live ambient background — persists across all dashboard pages */}
      <div className="live-bg" aria-hidden="true">
        <div className="orb-3" />
        <div className="orb-4" />
      </div>
      <Sidebar />
      <div className="relative flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
