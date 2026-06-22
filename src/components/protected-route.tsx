"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/store/hooks";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, mounted, pathname, router]);

  if (!mounted || !isAuthenticated) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 text-slate-500 dark:bg-black dark:text-zinc-400">
        <div className="rounded-3xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold shadow-soft dark:border-zinc-800 dark:bg-zinc-950">
          Checking session...
        </div>
      </div>
    );
  }

  return children;
}
