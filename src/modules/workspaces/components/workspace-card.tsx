"use client";

import Link from "next/link";
import { ArrowUpRight, FolderKanban, UserRound } from "lucide-react";
import type { Workspace, WorkspaceOwner } from "@/modules/workspaces/types";

type WorkspaceCardProps = {
  workspace: Workspace;
};

function getOwnerName(owner?: WorkspaceOwner) {
  if (!owner) {
    return "No owner assigned";
  }

  return typeof owner === "string" ? owner : owner.name;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  const fallback = getInitials(workspace.name) || "W";

  return (
    <Link
      href={`/workspaces/${workspace.id}`}
      className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-soft dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-900/70"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid size-12 place-items-center overflow-hidden rounded-2xl bg-blue-50 text-sm font-black text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
            {workspace.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={workspace.logo}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              fallback
            )}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-gray-950 dark:text-zinc-50">
              {workspace.name}
            </h3>
          </div>
        </div>

        <span className="grid size-9 place-items-center rounded-2xl border border-gray-200 text-gray-400 transition group-hover:border-blue-200 group-hover:text-blue-600 dark:border-zinc-800 dark:group-hover:border-blue-900/70 dark:group-hover:text-blue-500">
          <ArrowUpRight className="size-4" />
        </span>
      </div>

      <p className="mt-5 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-gray-500 dark:text-zinc-400">
        {workspace.description || "No description has been added yet."}
      </p>

      <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-zinc-800">
        <span className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-zinc-400">
          <UserRound className="size-4" />
          {getOwnerName(workspace.owner)}
        </span>
        <span className="flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-600 dark:bg-zinc-950 dark:text-zinc-300">
          <FolderKanban className="size-4 text-blue-600 dark:text-blue-500" />
          Workspace
        </span>
      </div>
    </Link>
  );
}
