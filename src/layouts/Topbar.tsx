"use client";

import { Bell, Menu, Search } from "lucide-react";
import { ThemeToggle } from "@/layouts/ThemeToggle";
import { UserMenu } from "@/layouts/UserMenu";

type TopbarProps = {
  onOpenSidebar: () => void;
};

export function Topbar({ onOpenSidebar }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-gray-50/85 px-4 py-4 backdrop-blur dark:border-zinc-800 dark:bg-black/85 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Open sidebar"
          onClick={onOpenSidebar}
          className="grid size-11 shrink-0 place-items-center rounded-2xl border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-red-200 hover:text-red-600 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-red-900/70 dark:hover:text-red-500 lg:hidden"
        >
          <Menu className="size-5" />
        </button>

        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
          <input
            aria-label="Search"
            placeholder="Search workspaces, projects, tasks..."
            className="h-11 w-full rounded-2xl border border-gray-200 bg-white pl-12 pr-4 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-red-600 focus:ring-4 focus:ring-red-600/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-red-500 dark:focus:ring-red-500/10"
          />
        </div>

        <ThemeToggle />

        <button
          type="button"
          aria-label="Notifications"
          className="relative hidden size-11 shrink-0 place-items-center rounded-2xl border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-red-200 hover:text-red-600 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-red-900/70 dark:hover:text-red-500 sm:grid"
        >
          <Bell className="size-5" />
          <span className="absolute right-3 top-3 size-2 rounded-full bg-red-600 ring-2 ring-white dark:bg-red-500 dark:ring-zinc-900" />
        </button>

        <UserMenu />
      </div>
    </header>
  );
}
