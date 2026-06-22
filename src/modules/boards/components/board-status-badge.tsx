import { cn } from "@/lib/utils";
import type { BoardStatus } from "@/modules/boards/types";

const statusClassName: Record<BoardStatus, string> = {
  ACTIVE:
    "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900/70",
  ARCHIVED:
    "bg-gray-100 text-gray-600 ring-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700",
};

export function BoardStatusBadge({ status }: { status: BoardStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1",
        statusClassName[status],
      )}
    >
      {status}
    </span>
  );
}
