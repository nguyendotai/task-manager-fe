"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Filter,
  LayoutGrid,
  List,
  MoreHorizontal,
  Pencil,
  Plus,
  Share2,
  Table2,
  Trash2,
  UsersRound,
} from "lucide-react";
import { Button, EmptyState, ErrorState, Skeleton } from "@/components/ui";
import {
  getBoardManagementError,
  useGetBoardQuery,
} from "@/features/board-management/api/board-management-api";
import { BoardVisibilityBadge } from "@/features/board-management/components/board-visibility-badge";
import { DeleteBoardConfirm } from "@/features/board-management/components/delete-board-confirm";
import { EditBoardModal } from "@/features/board-management/components/edit-board-modal";
import { canManageBoards } from "@/features/board-management/utils/board-permissions";
import { BoardStatusBadge } from "@/modules/boards/components/board-status-badge";
import { defaultBoardColumns } from "@/modules/boards/constants";
import type { BoardColumn } from "@/modules/boards/types";
import {
  clearLabels,
  fetchLabelsByWorkspace,
} from "@/modules/labels/store/label-slice";
import { useGetWorkspaceMembersQuery } from "@/features/workspace-members/api/workspace-members-api";
import { useWorkspaceMemberPermissions } from "@/features/workspace-members/hooks/use-workspace-member-permissions";
import type { WorkspaceMember } from "@/features/workspace-members/types";
import type { Label } from "@/modules/labels/types";
import { DeleteTaskConfirm } from "@/modules/tasks/components/delete-task-confirm";
import { TaskCard } from "@/modules/tasks/components/task-card";
import {
  TaskFilters,
  type TaskFiltersState,
} from "@/modules/tasks/components/task-filters";
import { TaskFormModal } from "@/modules/tasks/components/task-form-modal";
import { TaskDetailDrawer } from "@/modules/tasks/components/task-detail-drawer";
import {
  clearTaskErrors,
  clearTasks,
  createTask,
  deleteTask,
  fetchTasksByColumn,
  updateTask,
} from "@/modules/tasks/store/tasks-slice";
import type { Task, TaskFormValues } from "@/modules/tasks/types";
import type { TaskStatus } from "@/modules/tasks/types";
import {
  canDeleteTasks,
  canUpdateTasks,
} from "@/modules/tasks/utils/task-permissions";
import {
  getTaskAssigneeIds,
  getTaskVisibility,
} from "@/modules/tasks/utils/task-visibility";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

type BoardViewProps = {
  workspaceId: string;
  boardId: string;
};

type TaskModalState =
  | { mode: "create"; columnId: string; task: null }
  | { mode: "edit"; columnId: string; task: Task };

type DraggedTaskState = {
  task: Task;
  sourceColumnId: string;
};

const tabs = [
  { label: "Table", icon: Table2 },
  { label: "List", icon: List },
  { label: "Board", icon: LayoutGrid, active: true },
  { label: "Timeline", icon: Clock3 },
];

const emptyFilters: TaskFiltersState = {
  priorities: [],
  statuses: [],
  labels: [],
  assignees: [],
  visibilities: [],
};

export function BoardView({ workspaceId, boardId }: BoardViewProps) {
  const dispatch = useAppDispatch();
  const [taskModal, setTaskModal] = useState<TaskModalState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<TaskFiltersState>(emptyFilters);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [boardActionsOpen, setBoardActionsOpen] = useState(false);
  const [editBoardOpen, setEditBoardOpen] = useState(false);
  const [deleteBoardOpen, setDeleteBoardOpen] = useState(false);
  const [draggedTask, setDraggedTask] = useState<DraggedTaskState | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
  const {
    data: selectedBoard,
    isLoading: boardLoading,
    error: boardError,
    refetch: refetchBoard,
  } = useGetBoardQuery(boardId);
  const {
    byColumnId,
    loadingByColumnId,
    errorByColumnId,
    creating,
    updating,
    deleting,
    createError,
    updateError,
    deleteError,
  } = useAppSelector((state) => state.tasks);
  const { items: workspaceLabels } = useAppSelector((state) => state.labels);
  const { data: workspaceMembers = [], isLoading: membersLoading } =
    useGetWorkspaceMembersQuery(workspaceId);
  const permissions = useWorkspaceMemberPermissions(workspaceMembers);
  const canManageBoard = canManageBoards(permissions.role);
  const canUpdateTask = canUpdateTasks(permissions.role);
  const canDeleteTask = canDeleteTasks(permissions.role);

  useEffect(() => {
    dispatch(fetchLabelsByWorkspace(workspaceId));

    return () => {
      dispatch(clearTasks());
      dispatch(clearLabels());
    };
  }, [dispatch, workspaceId]);

  const columns = useMemo(() => {
    if (selectedBoard?.columns && selectedBoard.columns.length > 0) {
      return [...selectedBoard.columns].sort(
        (first, second) => (first.order ?? 0) - (second.order ?? 0),
      );
    }

    return defaultBoardColumns;
  }, [selectedBoard]);

  useEffect(() => {
    if (!selectedBoard) {
      return;
    }

    columns.forEach((column) => {
      if (column.id) {
        dispatch(fetchTasksByColumn(column.id));
      }
    });
  }, [columns, dispatch, selectedBoard]);

  const allTasks = useMemo(
    () => columns.flatMap((column) => byColumnId[column.id] ?? []),
    [byColumnId, columns],
  );

  const labelsById = useMemo(
    () =>
      workspaceLabels.reduce<Record<string, Label>>((accumulator, label) => {
        accumulator[label.id] = label;
        accumulator[label.name] = label;
        return accumulator;
      }, {}),
    [workspaceLabels],
  );

  const labelOptions = useMemo(() => {
    const taskLabelNames = allTasks
      .flatMap((task) => task.labels)
      .map((label) => labelsById[label]?.name ?? label);

    return Array.from(
      new Set([
        ...workspaceLabels.map((label) => label.name),
        ...taskLabelNames,
      ]),
    ).sort();
  }, [allTasks, labelsById, workspaceLabels]);

  if (boardLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="mt-6 h-9 w-2/3 rounded-full" />
        <Skeleton className="mt-4 h-4 w-full rounded-full" />
      </div>
    );
  }

  if (boardError) {
    return (
      <ErrorState
        title="Unable to load board"
        message={getBoardManagementError(boardError, "Unable to load board.")}
        onRetry={() => refetchBoard()}
      />
    );
  }

  if (!selectedBoard) {
    return null;
  }

  async function handleTaskSubmit(values: TaskFormValues) {
    if (!taskModal) {
      return;
    }

    if (taskModal.mode === "create") {
      const result = await dispatch(
        createTask({
          title: values.title,
          description: values.description,
          boardId,
          columnId: values.columnId,
          workspaceId,
          assignees: values.assignees,
          allowedMembers: values.allowedMembers,
          labels: values.labels,
          priority: values.priority,
          status: values.status,
          visibility: values.visibility,
          dueDate: values.dueDate,
          order: values.order,
        }),
      );

      if (createTask.fulfilled.match(result)) {
        setTaskModal(null);
      }

      return;
    }

    const result = await dispatch(
      updateTask({
        taskId: taskModal.task.id,
        data: {
          ...values,
          boardId,
          workspaceId,
        },
      }),
    );

    if (updateTask.fulfilled.match(result)) {
      setTaskModal(null);
    }
  }

  async function handleDeleteTask() {
    if (!deleteTarget) {
      return;
    }

    const result = await dispatch(deleteTask(deleteTarget.id));

    if (deleteTask.fulfilled.match(result)) {
      setDeleteTarget(null);
    }
  }

  async function handleTaskDrop(
    targetColumn: BoardColumn,
    targetTasks: Task[],
    targetIndex: number,
  ) {
    if (!draggedTask) {
      return;
    }

    const targetColumnId = targetColumn.id;
    const targetTasksWithoutDragged = targetTasks.filter(
      (task) => task.id !== draggedTask.task.id,
    );
    const order = getDropOrder(targetTasksWithoutDragged, targetIndex);

    await dispatch(
      updateTask({
        taskId: draggedTask.task.id,
        data: {
          columnId: targetColumnId,
          status: getStatusForColumn(targetColumn),
          order,
          boardId,
          workspaceId,
        },
      }),
    );

    setDraggedTask(null);
    setDragOverColumnId(null);
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/workspaces/${workspaceId}`}
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 transition hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-500"
      >
        <ArrowLeft className="size-4" />
        Back to workspace
      </Link>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <BoardStatusBadge status={selectedBoard.status} />
              <BoardVisibilityBadge board={selectedBoard} />
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900/70">
                <CheckCircle2 className="size-3.5" />
                Board view
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-normal text-gray-950 dark:text-zinc-50 md:text-4xl">
              {selectedBoard.name}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-500 dark:text-zinc-400">
              {selectedBoard.description ||
                "Move work across columns and keep workspace delivery visible."}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div className="flex -space-x-2">
                {["JD", "AM", "KL"].map((member) => (
                  <span
                    key={member}
                    className="grid size-9 place-items-center rounded-full border-2 border-white bg-gray-950 text-xs font-bold text-white dark:border-zinc-900 dark:bg-zinc-100 dark:text-zinc-950"
                  >
                    {member}
                  </span>
                ))}
              </div>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-zinc-400">
                <UsersRound className="size-4 text-blue-600 dark:text-blue-500" />
                Members placeholder
              </span>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-zinc-400">
                <CalendarDays className="size-4" />
                {selectedBoard.createdAt
                  ? new Date(selectedBoard.createdAt).toLocaleDateString()
                  : "New board"}
              </span>
            </div>
          </div>

          <div className="relative flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm">
              <Share2 className="size-4" />
              Share
            </Button>
            <Button
              type="button"
              onClick={() => setFilterPanelOpen((open) => !open)}
              variant="secondary"
              size="sm"
            >
              <Filter className="size-4" />
              Filter{" "}
              {getActiveFilterCount(filters) > 0
                ? `(${getActiveFilterCount(filters)})`
                : ""}
            </Button>
            {filterPanelOpen ? (
              <>
                <button
                  type="button"
                  aria-label="Close filter panel"
                  onClick={() => setFilterPanelOpen(false)}
                  className="fixed inset-0 z-40 cursor-default bg-transparent"
                />
                <div className="absolute right-0 top-12 z-50 w-[min(92vw,860px)]">
                  <TaskFilters
                    filters={filters}
                    labelOptions={labelOptions}
                    members={workspaceMembers}
                    onChange={setFilters}
                  />
                </div>
              </>
            ) : null}
            {canManageBoard ? (
              <div className="relative">
                <Button
                  type="button"
                  aria-label="Board actions"
                  aria-haspopup="menu"
                  aria-expanded={boardActionsOpen}
                  size="icon"
                  onClick={() => setBoardActionsOpen((open) => !open)}
                >
                  <MoreHorizontal className="size-5" />
                </Button>
                {boardActionsOpen ? (
                  <div className="absolute right-0 top-11 z-50 w-52 overflow-hidden rounded-2xl border border-gray-200 bg-white p-1 shadow-soft dark:border-zinc-800 dark:bg-zinc-950">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setEditBoardOpen(true);
                        setBoardActionsOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold text-gray-700 transition hover:bg-gray-50 dark:text-zinc-200 dark:hover:bg-zinc-900"
                    >
                      <Pencil className="size-4" />
                      Edit board
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setDeleteBoardOpen(true);
                        setBoardActionsOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold text-blue-600 transition hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950/30"
                    >
                      <Trash2 className="size-4" />
                      Delete board
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <Button
                key={tab.label}
                type="button"
                disabled={!tab.active}
                variant={tab.active ? "primary" : "ghost"}
                className={cn(
                  "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-bold transition",
                  tab.active
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 dark:bg-blue-500"
                    : "text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:text-zinc-400 dark:hover:bg-zinc-800",
                )}
              >
                <Icon className="size-4" />
                {tab.label}
              </Button>
            );
          })}
        </div>
      </section>

      <section className="overflow-x-auto pb-2">
        <div className="flex min-h-[520px] gap-4">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={filterTasks(
                byColumnId[column.id] ?? [],
                filters,
                labelsById,
              )}
              labelsById={labelsById}
              members={workspaceMembers}
              draggingTaskId={draggedTask?.task.id ?? null}
              dragOver={dragOverColumnId === column.id}
              loading={loadingByColumnId[column.id] ?? false}
              error={errorByColumnId[column.id] ?? null}
              onDragStart={(task) =>
                setDraggedTask({
                  task,
                  sourceColumnId: task.columnId ?? task.column,
                })
              }
              onDragEnd={() => {
                setDraggedTask(null);
                setDragOverColumnId(null);
              }}
              onDragOver={() => setDragOverColumnId(column.id)}
              onDrop={(targetIndex) =>
                handleTaskDrop(column, byColumnId[column.id] ?? [], targetIndex)
              }
              onRetry={() => dispatch(fetchTasksByColumn(column.id))}
              onAdd={() => {
                dispatch(clearTaskErrors());
                setTaskModal({
                  mode: "create",
                  columnId: column.id,
                  task: null,
                });
              }}
              onEdit={
                canUpdateTask
                  ? (task) => {
                      dispatch(clearTaskErrors());
                      setTaskModal({ mode: "edit", columnId: column.id, task });
                    }
                  : undefined
              }
              onOpenDetail={setDetailTask}
              onDelete={
                canDeleteTask
                  ? (task) => {
                      dispatch(clearTaskErrors());
                      setDeleteTarget(task);
                    }
                  : undefined
              }
            />
          ))}
        </div>
      </section>

      <TaskFormModal
        open={taskModal !== null}
        mode={taskModal?.mode ?? "create"}
        columns={columns}
        labelOptions={workspaceLabels}
        members={workspaceMembers}
        membersLoading={membersLoading}
        actorRole={permissions.role}
        initialColumnId={taskModal?.columnId}
        task={taskModal?.task ?? null}
        loading={taskModal?.mode === "edit" ? updating : creating}
        error={taskModal?.mode === "edit" ? updateError : createError}
        onClose={() => setTaskModal(null)}
        onSubmit={handleTaskSubmit}
      />

      <DeleteTaskConfirm
        task={deleteTarget}
        loading={deleting}
        error={deleteError}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteTask}
      />

      <TaskDetailDrawer
        task={detailTask}
        labelsById={labelsById}
        members={workspaceMembers}
        actorRole={permissions.role}
        onClose={() => setDetailTask(null)}
      />
      <EditBoardModal
        open={editBoardOpen}
        board={selectedBoard}
        members={workspaceMembers}
        actorRole={permissions.role}
        onClose={() => setEditBoardOpen(false)}
        workspaceId={workspaceId}
      />
      <DeleteBoardConfirm
        open={deleteBoardOpen}
        board={selectedBoard}
        workspaceId={workspaceId}
        redirectOnSuccess
        onClose={() => setDeleteBoardOpen(false)}
      />
    </div>
  );
}

function KanbanColumn({
  column,
  tasks,
  labelsById,
  members,
  draggingTaskId,
  dragOver,
  loading,
  error,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onRetry,
  onAdd,
  onEdit,
  onOpenDetail,
  onDelete,
}: {
  column: BoardColumn;
  tasks: Task[];
  labelsById: Record<string, Label>;
  members: WorkspaceMember[];
  draggingTaskId: string | null;
  dragOver: boolean;
  loading: boolean;
  error: string | null;
  onDragStart: (task: Task) => void;
  onDragEnd: () => void;
  onDragOver: () => void;
  onDrop: (targetIndex: number) => void;
  onRetry: () => void;
  onAdd: () => void;
  onEdit?: (task: Task) => void;
  onOpenDetail: (task: Task) => void;
  onDelete?: (task: Task) => void;
}) {
  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        onDragOver();
      }}
      onDrop={(event) => {
        event.preventDefault();
        onDrop(tasks.length);
      }}
      className={cn(
        "flex w-80 shrink-0 flex-col rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-sm transition dark:border-zinc-800 dark:bg-zinc-950",
        dragOver &&
          "border-blue-300 bg-blue-50/60 ring-4 ring-blue-600/10 dark:border-blue-900/70 dark:bg-blue-950/20",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-base font-bold text-gray-950 dark:text-zinc-50">
              {column.title}
            </h2>
            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-gray-500 ring-1 ring-gray-200 dark:bg-zinc-900 dark:text-zinc-400 dark:ring-zinc-800">
              {tasks.length}
            </span>
          </div>
        </div>

        <Button
          type="button"
          aria-label={`Add task to ${column.title}`}
          onClick={onAdd}
          size="icon"
          className="size-9 shrink-0"
        >
          <Plus className="size-4" />
        </Button>
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-3">
        {loading ? (
          <>
            <TaskSkeleton />
            <TaskSkeleton />
          </>
        ) : null}

        {!loading && error ? (
          <ErrorState
            title="Unable to load tasks"
            message={error}
            onRetry={onRetry}
            className="p-4"
          />
        ) : null}

        {!loading && !error && tasks.length === 0 ? (
          <EmptyState
            icon={<List className="size-7" />}
            title="No tasks"
            description="Add a task or adjust filters to show more work."
            className="min-h-40 bg-white/70 p-5 dark:bg-zinc-900/70"
          />
        ) : null}

        {!loading && !error
          ? tasks.map((task, index) => (
              <div
                key={task.id}
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", task.id);
                  onDragStart(task);
                }}
                onDragEnd={onDragEnd}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onDragOver();
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onDrop(index);
                }}
                className={cn(
                  "cursor-grab active:cursor-grabbing",
                  draggingTaskId === task.id && "opacity-45",
                )}
              >
                <TaskCard
                  task={task}
                  labelsById={labelsById}
                  members={members}
                  onEdit={onEdit}
                  onOpenDetail={onOpenDetail}
                  onDelete={onDelete}
                />
              </div>
            ))
          : null}
      </div>
    </div>
  );
}

function TaskSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="mt-4 h-4 w-4/5 rounded-full" />
      <Skeleton className="mt-3 h-3 w-full rounded-full" />
      <Skeleton className="mt-2 h-3 w-2/3 rounded-full" />
    </div>
  );
}

function filterTasks(
  tasks: Task[],
  filters: TaskFiltersState,
  labelsById: Record<string, Label>,
) {
  return tasks.filter((task) => {
    const taskLabelNames = task.labels.map(
      (label) => labelsById[label]?.name ?? label,
    );
    const assigneeIds = getTaskAssigneeIds(task);
    const matchesPriority =
      filters.priorities.length === 0 ||
      filters.priorities.includes(task.priority);
    const matchesStatus =
      filters.statuses.length === 0 || filters.statuses.includes(task.status);
    const matchesVisibility =
      filters.visibilities.length === 0 ||
      filters.visibilities.includes(getTaskVisibility(task));
    const matchesLabels =
      filters.labels.length === 0 ||
      filters.labels.some((label) => taskLabelNames.includes(label));
    const matchesAssignees =
      filters.assignees.length === 0 ||
      filters.assignees.some((assignee) => assigneeIds.includes(assignee));

    return (
      matchesPriority &&
      matchesStatus &&
      matchesVisibility &&
      matchesLabels &&
      matchesAssignees
    );
  });
}

function getActiveFilterCount(filters: TaskFiltersState) {
  return (
    filters.priorities.length +
    filters.statuses.length +
    filters.labels.length +
    filters.assignees.length +
    filters.visibilities.length
  );
}

function getDropOrder(tasks: Task[], targetIndex: number) {
  const beforeTask = targetIndex > 0 ? tasks[targetIndex - 1] : undefined;
  const afterTask = tasks[targetIndex];
  const beforeOrder = beforeTask?.order;
  const afterOrder = afterTask?.order;

  if (beforeOrder === undefined && afterOrder === undefined) {
    return 0;
  }

  if (beforeOrder === undefined) {
    return (afterOrder ?? 0) - 1000;
  }

  if (afterOrder === undefined) {
    return beforeOrder + 1000;
  }

  return (beforeOrder + afterOrder) / 2;
}

function getStatusForColumn(column: BoardColumn): TaskStatus {
  const value = `${column.id} ${column.title}`.toLowerCase();

  if (value.includes("done") || value.includes("complete")) {
    return "DONE";
  }

  if (value.includes("review")) {
    return "REVIEW";
  }

  if (value.includes("progress")) {
    return "IN_PROGRESS";
  }

  return "TODO";
}
