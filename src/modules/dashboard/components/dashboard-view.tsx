"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Gauge,
  ListTodo,
  Plus,
  RefreshCw,
  SquareKanban,
  Star,
  TimerReset,
  UserRound,
} from "lucide-react";
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  PriorityBadge,
  Skeleton,
  StatusBadge,
} from "@/components/ui";
import { dashboardService } from "@/modules/dashboard/services/dashboard-service";
import type {
  DashboardData,
  DashboardRelatedEntity,
  DashboardTask,
} from "@/modules/dashboard/types";
import type { TaskStatus } from "@/modules/tasks/types";

const statusRows: Array<{
  status: TaskStatus;
  label: string;
  color: string;
}> = [
  { status: "TODO", label: "To Do", color: "bg-gray-500" },
  { status: "IN_PROGRESS", label: "In Progress", color: "bg-blue-500" },
  { status: "REVIEW", label: "Review", color: "bg-amber-500" },
  { status: "DONE", label: "Done", color: "bg-emerald-500" },
];

export function DashboardView() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadDashboard() {
    setLoading(true);
    setError(null);

    try {
      setData(await dashboardService.getDashboard());
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const metrics = useMemo(() => {
    const summary = data?.counts;

    return [
      {
        label: "Workspaces",
        value: summary?.workspaces ?? 0,
        icon: BriefcaseBusiness,
      },
      {
        label: "Boards",
        value: summary?.boards ?? 0,
        icon: SquareKanban,
      },
      {
        label: "Tasks",
        value: summary?.tasks ?? 0,
        icon: CheckCircle2,
      },
      {
        label: "My Tasks",
        value: summary?.myTasks ?? 0,
        icon: UserRound,
      },
      {
        label: "Marked",
        value: summary?.markedTasks ?? 0,
        icon: Star,
      },
      {
        label: "Overdue",
        value: summary?.overdueTasks ?? 0,
        icon: TimerReset,
      },
      {
        label: "Completed",
        value: summary?.completedTasks ?? 0,
        icon: ListTodo,
      },
    ];
  }, [data]);

  const totalStatusTasks = statusRows.reduce(
    (total, row) => total + (data?.taskStatus[row.status] ?? 0),
    0,
  );

  return (
    <div className="space-y-6">
      <section className="p-6 ">
        <div className="flex gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xl font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-500">
              Dashboard
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/workspaces"
              className="inline-flex h-10 items-center justify-center gap-2 rounded border border-gray-200 bg-white px-4 text-sm font-bold text-gray-700 transition hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Workspaces
            </Link>
            <Link
              href="/workspaces"
              className="inline-flex h-10 items-center justify-center gap-2 rounded bg-blue-600 px-4 text-sm font-bold text-white shadow-lg -600/20 transition hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              <Plus className="size-5" />
              New Workspace
            </Link>
          </div>
        </div>
      </section>

      {loading ? <DashboardSkeleton /> : null}

      {!loading && error ? (
        <ErrorState
          title="Unable to load dashboard"
          message={error}
          onRetry={loadDashboard}
        />
      ) : null}

      {!loading && !error && data ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => {
              const Icon = metric.icon;

              return (
                <Card key={metric.label} className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="grid size-11 place-items-center rounded bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                      <Icon className="size-5" />
                    </div>
                  </div>
                  <p className="mt-5 text-sm font-semibold text-gray-500 dark:text-zinc-400">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-950 dark:text-zinc-50">
                    {metric.value}
                  </p>
                </Card>
              );
            })}
          </section>

          <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
            <Card className="p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-500">
                    Delivery
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-gray-950 dark:text-zinc-50">
                    Task statusd
                  </h2>
                </div>
                <span className="grid size-11 place-items-center rounded bg-blue-600 text-white shadow-lg -600/20 dark:bg-blue-500">
                  <SquareKanban className="size-5" />
                </span>
              </div>

              <div className="mt-6 space-y-4">
                {statusRows.map((row) => {
                  const count = data.taskStatus[row.status] ?? 0;
                  const percent =
                    totalStatusTasks > 0
                      ? Math.round((count / totalStatusTasks) * 100)
                      : 0;
                  return (
                    <div key={row.status}>
                      <div className="flex items-center justify-between gap-3 text-sm font-bold">
                        <span className="text-gray-700 dark:text-zinc-200">
                          {row.label}
                        </span>
                        <span className="text-gray-500 dark:text-zinc-400">
                          {count} task{count === 1 ? "" : "s"} · {percent}%
                        </span>
                      </div>
                      <div className="mt-2 h-3 overflow-hidden rounded bg-gray-100 dark:bg-zinc-800">
                        <div
                          className={`h-full rounded ${row.color}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-500">
                    Activity
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-gray-950 dark:text-zinc-50">
                    Recent tasks
                  </h2>
                </div>
                <Clock3 className="size-5 text-gray-400" />
              </div>

              <div className="mt-6 space-y-3">
                {data.recentTasks.length === 0 ? (
                  <EmptyState
                    icon={<ListTodo className="size-7" />}
                    title="No recent tasks"
                    className="min-h-48"
                  />
                ) : null}

                {data.recentTasks.map((task) => (
                  <RecentTaskItem key={task.id} task={task} />
                ))}
              </div>
            </Card>
          </section>
        </>
      ) : null}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="p-5">
            <Skeleton className="size-11 rounded" />
            <Skeleton className="mt-5 h-4 w-28 rounded" />
            <Skeleton className="mt-3 h-8 w-16 rounded" />
            <Skeleton className="mt-2 h-4 w-36 rounded" />
          </Card>
        ))}
      </section>
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card className="p-5">
          <Skeleton className="h-8 w-52 rounded" />
          <div className="mt-6 space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-9 rounded" />
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <Skeleton className="h-8 w-44 rounded" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded" />
            ))}
          </div>
        </Card>
      </section>
    </>
  );
}

function RecentTaskItem({ task }: { task: DashboardTask }) {
  return (
    <article className="rounded border border-gray-100 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-wrap items-center gap-2">
        <PriorityBadge priority={task.priority} />
        <StatusBadge status={task.status} />
      </div>
      <p className="mt-3 text-sm font-bold text-gray-950 dark:text-zinc-50">
        {task.title}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-500 dark:text-zinc-400">
        <span>{getEntityName(task.workspace, "Workspace")}</span>
        <span>/</span>
        <span>{getEntityName(task.board, "Board")}</span>
      </div>
    </article>
  );
}

function getEntityName(
  entity: DashboardRelatedEntity | string | undefined,
  fallback: string,
) {
  if (!entity) {
    return fallback;
  }

  return typeof entity === "string" ? entity : (entity.name ?? fallback);
}
