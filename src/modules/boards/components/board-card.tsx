"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Columns3,
  Pencil,
  Trash2,
} from "lucide-react";
import { BoardVisibilityBadge } from "@/features/board-management/components/board-visibility-badge";
import { BoardStatusBadge } from "@/modules/boards/components/board-status-badge";
import type { Board } from "@/modules/boards/types";

type BoardCardProps = {
  board: Board;
  workspaceId: string;
  projectId?: string;
  canManage?: boolean;
  onEdit?: (board: Board) => void;
  onDelete?: (board: Board) => void;
};

export function BoardCard({
  board,
  workspaceId,
  canManage,
  onEdit,
  onDelete,
}: BoardCardProps) {
  const columnsCount = board.columns?.length ?? 3;

  return (
    <article className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-soft dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-900/70">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap gap-2">
            <BoardStatusBadge status={board.status} />
            <BoardVisibilityBadge board={board} />
          </div>
          <Link
            href={`/workspaces/${workspaceId}/boards/${board.id}`}
            className="block truncate text-lg font-bold text-gray-950 transition hover:text-blue-600 dark:text-zinc-50 dark:hover:text-blue-400"
          >
            {board.name}
          </Link>
        </div>

        <Link
          href={`/workspaces/${workspaceId}/boards/${board.id}`}
          aria-label={`Open ${board.name}`}
          className="grid size-9 shrink-0 place-items-center rounded-2xl border border-gray-200 text-gray-400 transition group-hover:border-blue-200 group-hover:text-blue-600 dark:border-zinc-800 dark:group-hover:border-blue-900/70 dark:group-hover:text-blue-500"
        >
          <ArrowUpRight className="size-4" />
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 dark:border-zinc-800">
        <span className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-zinc-400">
          <Columns3 className="size-4 text-blue-600 dark:text-blue-500" />
          {columnsCount} columns
        </span>
        <span className="flex items-center justify-end gap-2 text-xs font-bold text-gray-500 dark:text-zinc-400">
          <CalendarDays className="size-4" />
          {board.createdAt
            ? new Date(board.createdAt).toLocaleDateString()
            : "New"}
        </span>
      </div>

      {canManage ? (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => onEdit?.(board)}
            className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-200 text-xs font-bold text-gray-600 transition hover:bg-gray-50 hover:text-gray-950 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          >
            <Pencil className="size-3.5" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete?.(board)}
            className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-50 text-xs font-bold text-blue-700 ring-1 ring-blue-200 transition hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-300 dark:ring-blue-900/70 dark:hover:bg-blue-950/50"
          >
            <Trash2 className="size-3.5" />
            Delete
          </button>
        </div>
      ) : null}
    </article>
  );
}
