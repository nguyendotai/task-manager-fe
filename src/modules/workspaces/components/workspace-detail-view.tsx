"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  FolderKanban,
  Plus,
  RefreshCw,
  Settings,
  Tags,
  UsersRound
} from "lucide-react";
import { Button } from "@/components/ui";
import {
  getBoardManagementError,
  useGetBoardsByWorkspaceQuery
} from "@/features/board-management/api/board-management-api";
import { canManageBoards } from "@/features/board-management/utils/board-permissions";
import { useGetWorkspaceMembersQuery } from "@/features/workspace-members/api/workspace-members-api";
import { useWorkspaceMemberPermissions } from "@/features/workspace-members/hooks/use-workspace-member-permissions";
import { BoardCard } from "@/modules/boards/components/board-card";
import { BoardListSkeleton } from "@/modules/boards/components/board-list-skeleton";
import { CreateBoardModal } from "@/modules/boards/components/create-board-modal";
import { LabelManager } from "@/modules/labels/components/label-manager";
import {
  clearSelectedWorkspace,
  fetchWorkspaceById
} from "@/modules/workspaces/store/workspace-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

type WorkspaceDetailViewProps = {
  workspaceId: string;
};

export function WorkspaceDetailView({ workspaceId }: WorkspaceDetailViewProps) {
  const dispatch = useAppDispatch();
  const [createBoardOpen, setCreateBoardOpen] = useState(false);
  const [labelManagerOpen, setLabelManagerOpen] = useState(false);
  const { selectedWorkspace, loading, error } = useAppSelector(
    (state) => state.workspaces
  );
  const {
    data: boards = [],
    isLoading: boardsLoading,
    error: boardsError,
    refetch: refetchBoards
  } = useGetBoardsByWorkspaceQuery(workspaceId);
  const { data: workspaceMembers = [] } = useGetWorkspaceMembersQuery(workspaceId);
  const permissions = useWorkspaceMemberPermissions(workspaceMembers);
  const canManageBoard = canManageBoards(permissions.role);

  useEffect(() => {
    dispatch(fetchWorkspaceById(workspaceId));

    return () => {
      dispatch(clearSelectedWorkspace());
    };
  }, [dispatch, workspaceId]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="h-4 w-32 animate-pulse rounded-full bg-gray-100 dark:bg-zinc-800" />
        <div className="mt-6 h-8 w-2/3 animate-pulse rounded-full bg-gray-100 dark:bg-zinc-800" />
        <div className="mt-4 h-4 w-full animate-pulse rounded-full bg-gray-100 dark:bg-zinc-800" />
        <div className="mt-2 h-4 w-4/5 animate-pulse rounded-full bg-gray-100 dark:bg-zinc-800" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
        <div className="flex gap-3">
          <AlertCircle className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-bold">Unable to load workspace</p>
            <p className="mt-1 text-sm leading-6">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedWorkspace) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Link
        href="/workspaces"
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 transition hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-500"
      >
        <ArrowLeft className="size-4" />
        Back to workspaces
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Link
          href={`/workspaces/${workspaceId}/members`}
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 text-sm font-bold text-gray-700 transition hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <UsersRound className="size-5" />
          Members
        </Link>
        <Link
          href={`/workspaces/${workspaceId}/settings`}
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 text-sm font-bold text-gray-700 transition hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <Settings className="size-5" />
          Settings
        </Link>
        <Button
          variant="secondary"
          size="lg"
          onClick={() => setLabelManagerOpen(true)}
        >
          <Tags className="size-5" />
          Label Manager
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={() => setCreateBoardOpen(true)}
        >
          <Plus className="size-5" />
          Create Board
        </Button>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-red-600 dark:text-red-500">
              Workspace
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-normal text-gray-950 dark:text-zinc-50">
              {selectedWorkspace.name}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-500 dark:text-zinc-400">
              {selectedWorkspace.description ||
                "No description has been added for this workspace."}
            </p>
          </div>

          <div className="grid size-16 place-items-center rounded-2xl bg-red-50 text-xl font-black text-red-600 dark:bg-red-950/40 dark:text-red-400">
            {selectedWorkspace.name.slice(0, 2).toUpperCase()}
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="flex items-center gap-2 text-sm font-bold text-gray-950 dark:text-zinc-50">
              <FolderKanban className="size-4 text-red-600 dark:text-red-500" />
              Slug
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
              /{selectedWorkspace.slug}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="flex items-center gap-2 text-sm font-bold text-gray-950 dark:text-zinc-50">
              <CalendarDays className="size-4 text-red-600 dark:text-red-500" />
              Created
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
              {selectedWorkspace.createdAt
                ? new Date(selectedWorkspace.createdAt).toLocaleDateString()
                : "Not available"}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {boardsLoading ? <BoardListSkeleton /> : null}

        {!boardsLoading && boardsError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                <AlertCircle className="mt-0.5 size-5 shrink-0" />
                <div>
                  <p className="font-bold">Unable to load boards</p>
                  <p className="mt-1 text-sm leading-6">
                    {getBoardManagementError(boardsError, "Unable to load boards.")}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => refetchBoards()}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 text-sm font-bold text-white transition hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
              >
                <RefreshCw className="size-4" />
                Retry
              </button>
            </div>
          </div>
        ) : null}

        {!boardsLoading && !boardsError && boards.length === 0 ? (
          <div className="grid min-h-72 place-items-center rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="max-w-md">
              <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                <FolderKanban className="size-7" />
              </div>
              <h2 className="mt-5 text-xl font-bold text-gray-950 dark:text-zinc-50">
                No boards yet
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-zinc-400">
                Create the first board for this workspace from the action
                button above.
              </p>
            </div>
          </div>
        ) : null}

        {!boardsLoading && !boardsError && boards.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {boards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                workspaceId={workspaceId}
                canManage={canManageBoard}
              />
            ))}
          </div>
        ) : null}
      </section>

      <CreateBoardModal
        open={createBoardOpen}
        workspaceId={workspaceId}
        members={workspaceMembers}
        actorRole={permissions.role}
        onClose={() => setCreateBoardOpen(false)}
      />
      <LabelManager
        open={labelManagerOpen}
        workspaceId={workspaceId}
        onClose={() => setLabelManagerOpen(false)}
      />
    </div>
  );
}
