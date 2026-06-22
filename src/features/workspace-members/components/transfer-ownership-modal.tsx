"use client";

import { FormEvent, useEffect, useState } from "react";
import { AlertTriangle, Crown } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button, Input, Modal } from "@/components/ui";
import { useToast } from "@/components/providers/toast-provider";
import {
  getWorkspaceMemberApiError,
  useTransferWorkspaceOwnershipMutation,
} from "@/features/workspace-members/api/workspace-members-api";
import { MemberAvatar } from "@/features/workspace-members/components/member-avatar";
import type { WorkspaceMember } from "@/features/workspace-members/types";
import {
  getMemberEmail,
  getMemberName,
} from "@/features/workspace-members/utils/member-selectors";

type TransferOwnershipModalProps = {
  open: boolean;
  workspaceId: string;
  member: WorkspaceMember | null;
  onClose: () => void;
};

export function TransferOwnershipModal({
  open,
  workspaceId,
  member,
  onClose,
}: TransferOwnershipModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [transferOwnership, { isLoading }] =
    useTransferWorkspaceOwnershipMutation();
  const [confirmation, setConfirmation] = useState("");

  useEffect(() => {
    if (!open) {
      setConfirmation("");
    }
  }, [open]);

  if (!open || !member) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (confirmation !== "TRANSFER" || !member) {
      return;
    }

    try {
      await transferOwnership({ workspaceId, memberId: member.id }).unwrap();
      toast({
        title: "Ownership transferred",
        description: `${getMemberName(member)} is now the workspace owner.`,
        variant: "success",
      });
      onClose();
      router.refresh();
    } catch (error) {
      toast({
        title: "Unable to transfer ownership",
        description: getWorkspaceMemberApiError(
          error,
          "Only workspace owners can transfer ownership.",
        ),
        variant: "error",
      });
    }
  }

  return (
    <Modal
      open={open}
      title="Transfer ownership"
      eyebrow="Danger zone"
      onClose={onClose}
    >
      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <MemberAvatar member={member} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-gray-950 dark:text-zinc-50">
              {getMemberName(member)}
            </p>
            <p className="truncate text-xs font-semibold text-gray-500 dark:text-zinc-400">
              {getMemberEmail(member)}
            </p>
          </div>
          <Crown className="size-5 text-blue-600 dark:text-blue-400" />
        </div>

        <div className="flex gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-blue-800 dark:border-blue-900/70 dark:bg-blue-950/30 dark:text-blue-200">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          This action transfers owner permissions. Your role may be changed and
          some workspace settings may no longer be available to you.
        </div>

        <label className="block">
          <span className="text-sm font-bold text-gray-700 dark:text-zinc-200">
            Type TRANSFER to confirm
          </span>
          <Input
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            className="mt-2 font-bold"
            placeholder="TRANSFER"
          />
        </label>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="danger"
            disabled={isLoading || confirmation !== "TRANSFER"}
          >
            {isLoading ? "Transferring..." : "Transfer ownership"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
