import { LockKeyhole, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui";
import type { Board } from "@/modules/boards/types";
import {
  getAllowedMembersCount,
  getBoardVisibility,
  isPrivateBoard
} from "@/features/board-management/utils/board-visibility";

export function BoardVisibilityBadge({ board }: { board: Board }) {
  const visibility = getBoardVisibility(board);

  if (isPrivateBoard(board)) {
    return (
      <span className="inline-flex items-center gap-2">
        <Badge tone="darkRed" className="gap-1.5">
          <LockKeyhole className="size-3.5" />
          PRIVATE
        </Badge>
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-500 dark:bg-zinc-800 dark:text-zinc-300">
          <UsersRound className="size-3.5" />
          {getAllowedMembersCount(board)}
        </span>
      </span>
    );
  }

  return <Badge tone="green">{visibility}</Badge>;
}
