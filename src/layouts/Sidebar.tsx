"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, X } from "lucide-react";
import { navigationItems } from "@/constants/navigation";
import { cn } from "@/lib/utils";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/35 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-gray-200 bg-white px-4 py-5 shadow-soft transition-transform duration-200 dark:border-zinc-800 dark:bg-zinc-950 lg:translate-x-0 lg:shadow-none",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-3 px-1"
          >
            <span className="grid size-11 place-items-center rounded-2xl bg-blue-600 text-lg font-black text-white shadow-lg shadow-blue-600/25 dark:bg-blue-500">
              A
            </span>
            <span>
              <span className="block text-base font-black tracking-normal text-gray-950 dark:text-zinc-50">
                NDT-Task
              </span>
              <span className="block text-xs font-medium text-gray-500 dark:text-zinc-400">
                SaaS workspace
              </span>
            </span>
          </Link>

          <button
            type="button"
            aria-label="Close sidebar"
            onClick={onClose}
            className="grid size-10 place-items-center rounded-2xl border border-gray-200 text-gray-500 transition hover:bg-gray-50 hover:text-gray-950 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50 lg:hidden"
          >
            <X className="size-5" />
          </button>
        </div>

        <SidebarNav onNavigate={onClose} />

        <div className="mt-auto rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/60 dark:bg-blue-950/25">
          <p className="text-sm font-bold text-blue-950 dark:text-blue-100">
            Workspace flow
          </p>
          <p className="mt-1 text-xs leading-5 text-blue-800 dark:text-blue-200">
            Projects, boards, tasks, and labels are managed inside each
            workspace.
          </p>
          <Link
            href="/workspaces"
            onClick={onClose}
            className="mt-3 inline-flex items-center gap-2 text-xs font-black text-blue-700 transition hover:text-blue-900 dark:text-blue-200 dark:hover:text-blue-100"
          >
            Open workspaces
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </aside>
    </>
  );
}

function SidebarNav({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="mt-8 space-y-1">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex h-11 items-center gap-3 rounded-2xl px-3 text-sm font-semibold transition",
              active
                ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100 dark:bg-blue-950/40 dark:text-blue-200 dark:ring-blue-900/60"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50",
            )}
          >
            <Icon className="size-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
