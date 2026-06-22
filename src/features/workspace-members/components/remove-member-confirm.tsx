"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import { Button, Modal } from "@/components/ui";
import { useToast } from "@/components/providers/toast-provider";
import {
  getWorkspaceMemberApiError,
  useRemoveWorkspaceMemberMutation
} from "@/features/workspace-members/api/workspace-members-api";
import { MemberAvatar } from "@/features/workspace-members/components/member-avatar";
import { RoleBadge } from "@/features/workspace-members/components/role-badge";
import type { WorkspaceMember } from "@/features/workspace-members/types";
import {
  getMemberEmail,
  getMemberName
} from "@/features/workspace-members/utils/member-selectors";

type RemoveMemberConfirmProps = {
  open: boolean;
  workspaceId: string;
  member: WorkspaceMember | null;
  onClose: () => void;
};

export function RemoveMemberConfirm({
  open,
  workspaceId,
  member,
  onClose
}: RemoveMemberConfirmProps) {
  const { toast } = useToast();
  const [removeMember, { isLoading }] = useRemoveWorkspaceMemberMutation();

  if (!open || !member) {
    return null;
  }

  async function handleConfirm() {
    if (!member) {
      return;
    }

    try {
      await removeMember({ workspaceId, memberId: member.id }).unwrap();
      toast({
        title: "Member removed",
        description: `${getMemberName(member)} no longer has workspace access.`,
        variant: "success"
      });
      onClose();
    } catch (error) {
      toast({
        title: "Unable to remove member",
        description: getWorkspaceMemberApiError(error, "Server rejected the remove request."),
        variant: "error"
      });
    }
  }

  return (
    <Modal open={open} title="Remove member" eyebrow="Danger zone" onClose={onClose}>
      <div className="mt-6 space-y-5">
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
          <RoleBadge role={member.role} />
        </div>

        <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-200">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          This removes the member from the workspace. They will lose access to
          private boards and tasks unless invited again.
        </div>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="danger" disabled={isLoading} onClick={handleConfirm}>
            <Trash2 className="size-4" />
            {isLoading ? "Removing..." : "Remove member"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
