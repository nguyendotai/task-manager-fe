import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/modules/projects/types";

const statusClassName: Record<ProjectStatus, string> = {
  ACTIVE:
    "bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900/70",
  ARCHIVED:
    "bg-gray-100 text-gray-600 ring-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700",
  COMPLETED:
    "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/35 dark:text-emerald-300 dark:ring-emerald-900/70"
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1",
        statusClassName[status]
      )}
    >
      {status}
    </span>
  );
}
