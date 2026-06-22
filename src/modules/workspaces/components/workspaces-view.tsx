"use client";

import { useEffect, useState } from "react";
import { AlertCircle, BriefcaseBusiness, Plus, RefreshCw } from "lucide-react";
import { CreateWorkspaceModal } from "@/modules/workspaces/components/create-workspace-modal";
import { WorkspaceCard } from "@/modules/workspaces/components/workspace-card";
import { WorkspaceListSkeleton } from "@/modules/workspaces/components/workspace-list-skeleton";
import { fetchWorkspaces } from "@/modules/workspaces/store/workspace-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function WorkspacesView() {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state) => state.workspaces);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchWorkspaces());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xl font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-500">
              Workspaces
            </p>
          </div>

          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <Plus className="size-5" />
            Create Workspace
          </button>
        </div>
      </section>

      {loading ? <WorkspaceListSkeleton /> : null}

      {!loading && error ? (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <AlertCircle className="mt-0.5 size-5 shrink-0" />
              <div>
                <p className="font-bold">Unable to load workspaces</p>
                <p className="mt-1 text-sm leading-6">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => dispatch(fetchWorkspaces())}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              <RefreshCw className="size-4" />
              Retry
            </button>
          </div>
        </div>
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <div className="grid min-h-96 place-items-center rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="max-w-md">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <BriefcaseBusiness className="size-7" />
            </div>
            <h2 className="mt-5 text-xl font-bold text-gray-950 dark:text-zinc-50">
              No workspaces yet
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-zinc-400">
              Create your first workspace to start grouping projects, boards,
              tasks, and team conversations.
            </p>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              <Plus className="size-5" />
              Create Workspace
            </button>
          </div>
        </div>
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((workspace) => (
            <WorkspaceCard key={workspace.id} workspace={workspace} />
          ))}
        </div>
      ) : null}

      <CreateWorkspaceModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
}
