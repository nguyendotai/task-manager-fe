"use client";

import { FormEvent, useEffect, useState } from "react";
import { AlertCircle, Save } from "lucide-react";
import { Button, Input, Modal } from "@/components/ui";
import { useToast } from "@/components/providers/toast-provider";
import {
  getBoardManagementError,
  getPrivateBoardPermissionError,
  useUpdateBoardMutation,
} from "@/features/board-management/api/board-management-api";
import { AllowedMembersPicker } from "@/features/board-management/components/allowed-members-picker";
import {
  getAllowedMemberIds,
  getBoardVisibility,
} from "@/features/board-management/utils/board-visibility";
import { canManageBoardVisibility } from "@/features/board-management/utils/board-permissions";
import type {
  WorkspaceMember,
  WorkspaceRole,
} from "@/features/workspace-members/types";
import type { Board, BoardVisibility } from "@/modules/boards/types";

type EditBoardModalProps = {
  open: boolean;
  board: Board | null;
  workspaceId?: string;
  projectId?: string;
  members: WorkspaceMember[];
  actorRole: WorkspaceRole | null;
  onClose: () => void;
  onUpdated?: (board: Board) => void;
};

type FormErrors = {
  name?: string;
  allowedMembers?: string;
};

export function EditBoardModal({
  open,
  board,
  workspaceId,
  projectId,
  members,
  actorRole,
  onClose,
  onUpdated,
}: EditBoardModalProps) {
  const { toast } = useToast();
  const [updateBoard, { isLoading }] = useUpdateBoardMutation();
  const [name, setName] = useState("");
  const [visibility, setVisibility] = useState<BoardVisibility>("PUBLIC");
  const [allowedMembers, setAllowedMembers] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!open || !board) {
      return;
    }

    setName(board.name);
    setVisibility(getBoardVisibility(board));
    setAllowedMembers(getAllowedMemberIds(board));
    setErrors({});
  }, [board, open]);

  if (!open || !board) {
    return null;
  }

  const canManagePrivate = canManageBoardVisibility(actorRole);

  function validate() {
    const nextErrors: FormErrors = {};

    if (name.trim().length < 2) {
      nextErrors.name = "Board name must be at least 2 characters.";
    }

    if (visibility === "PRIVATE" && allowedMembers.length === 0) {
      nextErrors.allowedMembers =
        "Private boards require at least one allowed member.";
    }

    if (visibility === "PRIVATE" && !canManagePrivate) {
      nextErrors.allowedMembers =
        "You do not have permission to manage private boards.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!board || !validate()) {
      return;
    }

    try {
      const updatedBoard = await updateBoard({
        boardId: board.id,
        workspaceId: workspaceId ?? projectId,
        data: {
          name: name.trim(),
          visibility,
          allowedMembers: visibility === "PRIVATE" ? allowedMembers : [],
        },
      }).unwrap();
      toast({
        title: "Board updated",
        description: `${updatedBoard.name} settings were saved.`,
        variant: "success",
      });
      onUpdated?.(updatedBoard);
      onClose();
    } catch (error) {
      toast({
        title: "Unable to update board",
        description:
          visibility === "PRIVATE"
            ? getPrivateBoardPermissionError(error)
            : getBoardManagementError(
                error,
                "You do not have permission to update this board.",
              ),
        variant: "error",
      });
    }
  }

  return (
    <Modal open={open} title="Edit board" eyebrow="Board" onClose={onClose}>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm font-bold text-gray-700 dark:text-zinc-200">
            Name
          </span>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2"
          />
          {errors.name ? (
            <span className="mt-1 block text-xs font-semibold text-blue-600 dark:text-blue-400">
              {errors.name}
            </span>
          ) : null}
        </label>

        <label className="block">
          <span className="text-sm font-bold text-gray-700 dark:text-zinc-200">
            Visibility
          </span>
          <select
            value={visibility}
            onChange={(event) =>
              setVisibility(event.target.value as BoardVisibility)
            }
            className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
          >
            <option value="PUBLIC">PUBLIC</option>
            <option value="PRIVATE" disabled={!canManagePrivate}>
              PRIVATE
            </option>
          </select>
          {!canManagePrivate ? (
            <p className="mt-2 flex gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
              <AlertCircle className="size-3.5" />
              You do not have permission to manage private boards.
            </p>
          ) : null}
        </label>

        {visibility === "PRIVATE" ? (
          <div>
            <span className="text-sm font-bold text-gray-700 dark:text-zinc-200">
              Allowed members
            </span>
            <div className="mt-2">
              <AllowedMembersPicker
                members={members}
                value={allowedMembers}
                onChange={setAllowedMembers}
              />
            </div>
            {errors.allowedMembers ? (
              <span className="mt-2 block text-xs font-semibold text-blue-600 dark:text-blue-400">
                {errors.allowedMembers}
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Save className="size-4" />
            {isLoading ? "Saving..." : "Save board"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
