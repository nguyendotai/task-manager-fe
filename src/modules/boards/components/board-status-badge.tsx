import { cn } from "@/lib/utils";
import type { BoardStatus } from "@/modules/boards/types";

const statusClassName: Record<BoardStatus, string> = {
  ACTIVE:
    "bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900/70",
  ARCHIVED:
    "bg-gray-100 text-gray-600 ring-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700"
};

export function BoardStatusBadge({ status }: { status: BoardStatus }) {
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
