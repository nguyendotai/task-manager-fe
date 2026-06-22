"use client";

import { useRouter } from "next/navigation";
import { useToast } from "@/components/providers/toast-provider";
import {
  getBoardManagementError,
  useDeleteBoardMutation
} from "@/features/board-management/api/board-management-api";
import { ConfirmModal } from "@/features/board-management/components/confirm-modal";
import type { Board } from "@/modules/boards/types";

type DeleteBoardConfirmProps = {
  open: boolean;
  board: Board | null;
  workspaceId: string;
  projectId?: string;
  redirectOnSuccess?: boolean;
  onClose: () => void;
  onDeleted?: (boardId: string) => void;
};

export function DeleteBoardConfirm({
  open,
  board,
  workspaceId,
  redirectOnSuccess,
  onClose,
  onDeleted
}: DeleteBoardConfirmProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [deleteBoard, { isLoading }] = useDeleteBoardMutation();

  async function handleConfirm() {
    if (!board) {
      return;
    }

    try {
      await deleteBoard({ boardId: board.id, workspaceId }).unwrap();
      toast({
        title: "Board deleted",
        description: `${board.name} was deleted.`,
        variant: "success"
      });
      onDeleted?.(board.id);
      onClose();

      if (redirectOnSuccess) {
        router.replace(`/workspaces/${workspaceId}`);
      }
    } catch (error) {
      toast({
        title: "Unable to delete board",
        description: getBoardManagementError(
          error,
          "You do not have permission to delete this board."
        ),
        variant: "error"
      });
    }
  }

  return (
    <ConfirmModal
      open={open && board !== null}
      title={board ? `Delete ${board.name}` : "Delete board"}
      eyebrow="Danger zone"
      message="All tasks inside this board may become inaccessible."
      confirmLabel="Delete board"
      loading={isLoading}
      onConfirm={handleConfirm}
      onClose={onClose}
    />
  );
}
