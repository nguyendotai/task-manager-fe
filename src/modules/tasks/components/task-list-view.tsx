"use client";

import { useEffect } from "react";
import { useState } from "react";
import { Clock3, ListTodo, RefreshCw, Star, UserRound } from "lucide-react";
import {
  Button,
  Card,
  CardSkeleton,
  EmptyState,
  ErrorState,
} from "@/components/ui";
import { TaskCard } from "@/modules/tasks/components/task-card";
import { TaskDetailDrawer } from "@/modules/tasks/components/task-detail-drawer";
import {
  fetchTaskList,
  toggleTaskMark,
} from "@/modules/tasks/store/tasks-slice";
import type { TaskListKind } from "@/modules/tasks/types";
import type { Task } from "@/modules/tasks/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

type TaskListViewProps = {
  kind: TaskListKind;
};

const pageConfig: Record<
  TaskListKind,
  {
    eyebrow: string;
    title: string;
    description: string;
    emptyText: string;
    icon: typeof ListTodo;
  }
> = {
  my: {
    eyebrow: "My Tasks",
    title: "Tasks assigned to you",
    description:
      "Review work that has been assigned to your account across workspaces.",
    emptyText: "No assigned tasks yet.",
    icon: UserRound,
  },
  recent: {
    eyebrow: "Recent",
    title: "Recently created tasks",
    description: "Track new work created in workspaces you can access.",
    emptyText: "No recent tasks found.",
    icon: Clock3,
  },
  marked: {
    eyebrow: "Marked",
    title: "Marked tasks",
    description:
      "Keep important tasks close by with your personal marked list.",
    emptyText: "You have not marked any tasks yet.",
    icon: Star,
  },
};

export function TaskListView({ kind }: TaskListViewProps) {
  const dispatch = useAppDispatch();
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const { lists, loadingLists, listErrors, markError } = useAppSelector(
    (state) => state.tasks,
  );
  const config = pageConfig[kind];
  const Icon = config.icon;
  const tasks = lists[kind];
  const loading = loadingLists[kind];
  const error = listErrors[kind];

  useEffect(() => {
    dispatch(fetchTaskList(kind));
  }, [dispatch, kind]);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-500">
              <Icon className="size-4" />
              {config.eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-normal text-gray-950 dark:text-zinc-50">
              {config.title}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500 dark:text-zinc-400">
              {config.description}
            </p>
          </div>

          <Button
            type="button"
            onClick={() => dispatch(fetchTaskList(kind))}
            variant="secondary"
          >
            <RefreshCw className="size-4" />
            Refresh
          </Button>
        </div>
      </Card>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      ) : null}

      {markError ? (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200">
          {markError}
        </div>
      ) : null}

      {!loading && error ? (
        <ErrorState
          title="Unable to load tasks"
          message={error}
          onRetry={() => dispatch(fetchTaskList(kind))}
        />
      ) : null}

      {!loading && !error && tasks.length === 0 ? (
        <EmptyState
          icon={<Icon className="size-7" />}
          title={config.emptyText}
        />
      ) : null}

      {!loading && !error && tasks.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onOpenDetail={setDetailTask}
              onToggleMark={() =>
                dispatch(
                  toggleTaskMark({
                    taskId: task.id,
                    marked: !task.isMarked,
                  }),
                )
              }
            />
          ))}
        </div>
      ) : null}

      <TaskDetailDrawer task={detailTask} onClose={() => setDetailTask(null)} />
    </div>
  );
}
