"use client";

import { ChevronDown, LogOut, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { authService } from "@/modules/auth/services/auth-service";
import { logout } from "@/modules/auth/store/auth-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function UserMenu() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  async function handleLogout() {
    try {
      await authService.logout();
    } finally {
      dispatch(logout());
      router.replace("/login");
    }
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex h-11 items-center gap-2 rounded-2xl border border-gray-200 bg-white px-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-blue-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-blue-900/70"
      >
        <span className="grid size-8 place-items-center rounded-xl bg-blue-600 text-xs font-bold text-white dark:bg-blue-500">
          {user?.avatarFallback ?? "AT"}
        </span>
        <span className="hidden max-w-28 truncate xl:block">
          {user?.name ?? "AL-TASK User"}
        </span>
        <ChevronDown className="size-4 text-gray-400" />
      </button>

      {open ? (
        <div className="absolute right-0 top-14 z-50 w-64 rounded-2xl border border-gray-200 bg-white p-2 shadow-soft dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3 rounded-xl px-3 py-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-gray-900 text-sm font-bold text-white dark:bg-zinc-100 dark:text-zinc-950">
              {user?.avatarFallback ?? "AT"}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-gray-950 dark:text-zinc-50">
                {user?.name ?? "AL-TASK User"}
              </p>
              <p className="truncate text-xs text-gray-500 dark:text-zinc-400">
                {user?.email ?? "user@altask.app"}
              </p>
            </div>
          </div>

          <div className="my-2 h-px bg-gray-100 dark:bg-zinc-800" />

          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-gray-950 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          >
            <UserRound className="size-4" />
            Profile
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30"
          >
            <LogOut className="size-4" />
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}
