"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Columns3,
  FolderKanban,
  Plus,
  RefreshCw,
  UserRound
} from "lucide-react";
import {
  getBoardManagementError,
  useGetBoardsByProjectQuery
} from "@/features/board-management/api/board-management-api";
import { DeleteBoardConfirm } from "@/features/board-management/components/delete-board-confirm";
import { EditBoardModal } from "@/features/board-management/components/edit-board-modal";
import { canManageBoards } from "@/features/board-management/utils/board-permissions";
import { useGetWorkspaceMembersQuery } from "@/features/workspace-members/api/workspace-members-api";
import { useWorkspaceMemberPermissions } from "@/features/workspace-members/hooks/use-workspace-member-permissions";
import { BoardCard } from "@/modules/boards/components/board-card";
import { BoardListSkeleton } from "@/modules/boards/components/board-list-skeleton";
import { CreateBoardModal } from "@/modules/boards/components/create-board-modal";
import type { Board } from "@/modules/boards/types";
import { ProjectStatusBadge } from "@/modules/projects/components/project-status-badge";
import {
  clearSelectedProject,
  fetchProjectById
} from "@/modules/projects/store/project-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

type ProjectDetailViewProps = {
  workspaceId: string;
  projectId: string;
};

export function ProjectDetailView({
  workspaceId,
  projectId
}: ProjectDetailViewProps) {
  const dispatch = useAppDispatch();
  const [createBoardOpen, setCreateBoardOpen] = useState(false);
  const [editBoardTarget, setEditBoardTarget] = useState<Board | null>(null);
  const [deleteBoardTarget, setDeleteBoardTarget] = useState<Board | null>(null);
  const { selectedProject, loading, error } = useAppSelector(
    (state) => state.projects
  );
  const {
    data: boards = [],
    isLoading: boardsLoading,
    isFetching: boardsFetching,
    error: boardsError,
    refetch: refetchBoards
  } = useGetBoardsByProjectQuery(projectId);
  const { data: workspaceMembers = [] } =
    useGetWorkspaceMembersQuery(workspaceId);
  const permissions = useWorkspaceMemberPermissions(workspaceMembers);
  const canManage = canManageBoards(permissions.role);

  useEffect(() => {
    dispatch(fetchProjectById(projectId));

    return () => {
      dispatch(clearSelectedProject());
    };
  }, [dispatch, projectId]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="h-6 w-24 animate-pulse rounded-full bg-gray-100 dark:bg-zinc-800" />
        <div className="mt-6 h-9 w-2/3 animate-pulse rounded-full bg-gray-100 dark:bg-zinc-800" />
        <div className="mt-4 h-4 w-full animate-pulse rounded-full bg-gray-100 dark:bg-zinc-800" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
        <div className="flex gap-3">
          <AlertCircle className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-bold">Unable to load project</p>
            <p className="mt-1 text-sm leading-6">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedProject) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/workspaces/${workspaceId}`}
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 transition hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-500"
      >
        <ArrowLeft className="size-4" />
        Back to workspace
      </Link>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <ProjectStatusBadge status={selectedProject.status} />
            <h1 className="mt-4 text-3xl font-bold tracking-normal text-gray-950 dark:text-zinc-50">
              {selectedProject.name}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-500 dark:text-zinc-400">
              {selectedProject.description ||
                "No description has been added for this project."}
            </p>
          </div>

          <div className="grid size-16 place-items-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
            <FolderKanban className="size-8" />
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="flex items-center gap-2 text-sm font-bold text-gray-950 dark:text-zinc-50">
              <FolderKanban className="size-4 text-red-600 dark:text-red-500" />
              Workspace
            </p>
            <p className="mt-2 truncate text-sm text-gray-500 dark:text-zinc-400">
              {typeof selectedProject.workspace === "string"
                ? selectedProject.workspace
                : selectedProject.workspace.name}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="flex items-center gap-2 text-sm font-bold text-gray-950 dark:text-zinc-50">
              <UserRound className="size-4 text-red-600 dark:text-red-500" />
              Created by
            </p>
            <p className="mt-2 truncate text-sm text-gray-500 dark:text-zinc-400">
              {!selectedProject.createdBy
                ? "Not available"
                : typeof selectedProject.createdBy === "string"
                  ? selectedProject.createdBy
                  : selectedProject.createdBy.name}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-red-600 dark:text-red-500">
              Boards
            </p>
            <h2 className="mt-2 text-2xl font-bold text-gray-950 dark:text-zinc-50">
              Project boards
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-zinc-400">
              Manage Kanban boards for planning, delivery, and release tracking.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setCreateBoardOpen(true)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
          >
            <Plus className="size-5" />
            Create Board
          </button>
        </div>

        {boardsLoading || boardsFetching ? <BoardListSkeleton /> : null}

        {!boardsLoading && !boardsFetching && boardsError ? (
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

        {!boardsLoading && !boardsFetching && !boardsError && boards.length === 0 ? (
          <div className="grid min-h-72 place-items-center rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="max-w-md">
              <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                <Columns3 className="size-7" />
              </div>
              <h2 className="mt-5 text-xl font-bold text-gray-950 dark:text-zinc-50">
                No boards yet
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-zinc-400">
                Create a Kanban board for this project. The backend will attach
                the default To Do, In Progress, and Done columns.
              </p>
              <button
                type="button"
                onClick={() => setCreateBoardOpen(true)}
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
              >
                <Plus className="size-5" />
                Create Board
              </button>
            </div>
          </div>
        ) : null}

        {!boardsLoading && !boardsFetching && !boardsError && boards.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {boards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                workspaceId={workspaceId}
                projectId={projectId}
                canManage={canManage}
                onEdit={setEditBoardTarget}
                onDelete={setDeleteBoardTarget}
              />
            ))}
          </div>
        ) : null}
      </section>

      <CreateBoardModal
        open={createBoardOpen}
        projectId={projectId}
        members={workspaceMembers}
        actorRole={permissions.role}
        onClose={() => setCreateBoardOpen(false)}
      />
      <EditBoardModal
        open={editBoardTarget !== null}
        board={editBoardTarget}
        members={workspaceMembers}
        actorRole={permissions.role}
        onClose={() => setEditBoardTarget(null)}
        projectId={projectId}
      />
      <DeleteBoardConfirm
        open={deleteBoardTarget !== null}
        board={deleteBoardTarget}
        workspaceId={workspaceId}
        projectId={projectId}
        onClose={() => setDeleteBoardTarget(null)}
      />
    </div>
  );
}
