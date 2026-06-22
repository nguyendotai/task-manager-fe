import { cn } from "@/lib/utils";
import type { TaskPriority, TaskStatus } from "@/modules/tasks/types";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "red" | "gray" | "blue" | "green" | "amber" | "darkRed";
};

const toneClassName = {
  red: "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900/70",
  darkRed:
    "bg-blue-900 text-white ring-blue-900 dark:bg-blue-700 dark:text-white dark:ring-blue-700",
  gray: "bg-gray-100 text-gray-600 ring-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700",
  blue: "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900/70",
  green:
    "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/35 dark:text-emerald-300 dark:ring-emerald-900/70",
  amber:
    "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900/70",
};

export function Badge({ className, tone = "gray", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1",
        toneClassName[tone],
        className,
      )}
      {...props}
    />
  );
}

const priorityTone: Record<TaskPriority, BadgeProps["tone"]> = {
  LOW: "gray",
  MEDIUM: "blue",
  HIGH: "red",
  URGENT: "darkRed",
};

const statusTone: Record<TaskStatus, BadgeProps["tone"]> = {
  TODO: "gray",
  IN_PROGRESS: "blue",
  REVIEW: "amber",
  DONE: "green",
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return <Badge tone={priorityTone[priority]}>{priority}</Badge>;
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  return <Badge tone={statusTone[status]}>{status}</Badge>;
}
