"use client";

import { AlertCircle, X } from "lucide-react";
import type { Task } from "@/modules/tasks/types";

type DeleteTaskConfirmProps = {
  task: Task | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteTaskConfirm({
  task,
  loading,
  error,
  onClose,
  onConfirm
}: DeleteTaskConfirmProps) {
  if (!task) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[85] grid place-items-center bg-black/45 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-soft dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-red-600 dark:text-red-500">
              Delete task
            </p>
            <h2 className="mt-2 text-2xl font-bold text-gray-950 dark:text-zinc-50">
              Remove this task?
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close delete confirmation"
            onClick={onClose}
            className="grid size-10 place-items-center rounded-2xl border border-gray-200 text-gray-500 transition hover:bg-gray-50 hover:text-gray-950 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          >
            <X className="size-5" />
          </button>
        </div>

        <p className="mt-4 text-sm leading-6 text-gray-500 dark:text-zinc-400">
          This will delete <span className="font-bold">{task.title}</span> from the
          board.
        </p>

        {error ? (
          <div className="mt-5 flex gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-2xl border border-gray-200 bg-white px-5 text-sm font-bold text-gray-700 transition hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="h-11 rounded-2xl bg-red-600 px-5 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-red-500 dark:hover:bg-red-600"
          >
            {loading ? "Deleting..." : "Delete Task"}
          </button>
        </div>
      </div>
    </div>
  );
}
