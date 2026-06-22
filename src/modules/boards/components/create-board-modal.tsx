"use client";

import { FormEvent, useEffect, useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { AllowedMembersPicker } from "@/features/board-management/components/allowed-members-picker";
import {
  getBoardManagementError,
  getPrivateBoardPermissionError,
  useCreateBoardMutation
} from "@/features/board-management/api/board-management-api";
import { canManageBoardVisibility } from "@/features/board-management/utils/board-permissions";
import type {
  WorkspaceMember,
  WorkspaceRole
} from "@/features/workspace-members/types";
import type { Board, BoardVisibility } from "@/modules/boards/types";

type CreateBoardModalProps = {
  open: boolean;
  workspaceId?: string;
  projectId?: string;
  members?: WorkspaceMember[];
  actorRole?: WorkspaceRole | null;
  onClose: () => void;
  onCreated?: (board: Board) => void;
};

type FormErrors = {
  name?: string;
  allowedMembers?: string;
};

export function CreateBoardModal({
  open,
  workspaceId,
  projectId,
  members = [],
  actorRole = null,
  onClose,
  onCreated
}: CreateBoardModalProps) {
  const [createBoard, { isLoading }] = useCreateBoardMutation();
  const [name, setName] = useState("");
  const [visibility, setVisibility] = useState<BoardVisibility>("PUBLIC");
  const [allowedMembers, setAllowedMembers] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const canManagePrivate = canManageBoardVisibility(actorRole);
  const targetWorkspaceId = workspaceId ?? projectId ?? "";

  useEffect(() => {
    if (!open) {
      setName("");
      setVisibility("PUBLIC");
      setAllowedMembers([]);
    }

    setErrors({});
    setServerError(null);
  }, [open]);

  if (!open) {
    return null;
  }

  function validate() {
    const nextErrors: FormErrors = {};

    if (name.trim().length < 2) {
      nextErrors.name = "Board name must be at least 2 characters.";
    }

    if (visibility === "PRIVATE" && !canManagePrivate) {
      nextErrors.allowedMembers =
        "You do not have permission to manage private boards.";
    }

    if (visibility === "PRIVATE" && allowedMembers.length === 0) {
      nextErrors.allowedMembers =
        "Private boards require at least one allowed member.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      const result = await createBoard({
        name: name.trim(),
        workspaceId: targetWorkspaceId,
        visibility,
        allowedMembers: visibility === "PRIVATE" ? allowedMembers : []
      }).unwrap();
      onCreated?.(result);
      onClose();
    } catch (error) {
      setServerError(
        visibility === "PRIVATE"
          ? getPrivateBoardPermissionError(error)
          : getBoardManagementError(
              error,
              "You do not have permission to create this board."
            )
      );
    }
  }

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/45 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-5 shadow-soft dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-red-600 dark:text-red-500">
              New board
            </p>
            <h2 className="mt-2 text-2xl font-bold text-gray-950 dark:text-zinc-50">
              Create Board
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-zinc-400">
              New boards start with To Do, In Progress, and Done columns.
            </p>
          </div>

          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="grid size-10 place-items-center rounded-2xl border border-gray-200 text-gray-500 transition hover:bg-gray-50 hover:text-gray-950 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          >
            <X className="size-5" />
          </button>
        </div>

        {serverError ? (
          <div className="mt-5 flex gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        ) : null}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-bold text-gray-700 dark:text-zinc-200">
              Name
            </span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-red-600 focus:ring-4 focus:ring-red-600/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-red-500 dark:focus:ring-red-500/10"
              placeholder="Sprint board"
            />
            {errors.name ? (
              <span className="mt-1 block text-xs font-semibold text-red-600 dark:text-red-400">
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
              className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-950 outline-none transition focus:border-red-600 focus:ring-4 focus:ring-red-600/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
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
                <span className="mt-2 block text-xs font-semibold text-red-600 dark:text-red-400">
                  {errors.allowedMembers}
                </span>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-2xl border border-gray-200 bg-white px-5 text-sm font-bold text-gray-700 transition hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="h-11 rounded-2xl bg-red-600 px-5 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-red-500 dark:hover:bg-red-600"
            >
              {isLoading ? "Creating..." : "Create Board"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
