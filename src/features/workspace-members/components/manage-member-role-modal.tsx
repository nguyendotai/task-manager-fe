"use client";

import { FormEvent, useEffect, useState } from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { Button, Modal } from "@/components/ui";
import { useToast } from "@/components/providers/toast-provider";
import {
  getWorkspaceMemberApiError,
  useUpdateWorkspaceMemberRoleMutation
} from "@/features/workspace-members/api/workspace-members-api";
import { MemberAvatar } from "@/features/workspace-members/components/member-avatar";
import { RoleBadge } from "@/features/workspace-members/components/role-badge";
import type {
  InvitationRole,
  WorkspaceMember,
  WorkspaceRole
} from "@/features/workspace-members/types";
import {
  canAssignRole,
  inviteRoles,
  roleDescription,
  roleLabel,
  roleRank
} from "@/features/workspace-members/utils/role-utils";
import {
  getMemberEmail,
  getMemberName
} from "@/features/workspace-members/utils/member-selectors";

type ManageMemberRoleModalProps = {
  open: boolean;
  workspaceId: string;
  actorRole: WorkspaceRole | null;
  member: WorkspaceMember | null;
  onClose: () => void;
};

export function ManageMemberRoleModal({
  open,
  workspaceId,
  actorRole,
  member,
  onClose
}: ManageMemberRoleModalProps) {
  const { toast } = useToast();
  const [updateRole, { isLoading }] = useUpdateWorkspaceMemberRoleMutation();
  const [role, setRole] = useState<InvitationRole>("MEMBER");

  useEffect(() => {
    if (member && member.role !== "WORKSPACE_OWNER") {
      setRole(member.role);
    }
  }, [member]);

  if (!open || !member) {
    return null;
  }

  const isOwner = member.role === "WORKSPACE_OWNER";
  const transition =
    roleRank[role] > roleRank[member.role]
      ? "upgrade"
      : roleRank[role] < roleRank[member.role]
        ? "downgrade"
        : "same";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!member || isOwner || !canAssignRole(actorRole, role)) {
      return;
    }

    try {
      await updateRole({
        workspaceId,
        memberId: member.id,
        data: { role }
      }).unwrap();
      toast({
        title: "Role updated",
        description: `${getMemberName(member)} is now ${roleLabel[role]}.`,
        variant: "success"
      });
      onClose();
    } catch (error) {
      toast({
        title: "Unable to update role",
        description: getWorkspaceMemberApiError(error, "You do not have permission to update this member."),
        variant: "error"
      });
    }
  }

  return (
    <Modal
      open={open}
      title="Manage member role"
      eyebrow="Permissions"
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
          <RoleBadge role={member.role} />
        </div>

        {isOwner ? (
          <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-200">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            Owner role cannot be edited here. Use transfer ownership instead.
          </div>
        ) : (
          <label className="block">
            <span className="text-sm font-bold text-gray-700 dark:text-zinc-200">
              New role
            </span>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as InvitationRole)}
              className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-950 outline-none transition focus:border-red-600 focus:ring-4 focus:ring-red-600/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
            >
              {inviteRoles.map((item) => (
                <option
                  key={item}
                  value={item}
                  disabled={!canAssignRole(actorRole, item)}
                >
                  {roleLabel[item]}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs leading-5 text-gray-500 dark:text-zinc-400">
              {roleDescription[role]}
            </p>
          </label>
        )}

        {!isOwner && transition !== "same" ? (
          <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-200">
            <ShieldCheck className="mt-0.5 size-4 shrink-0" />
            This will {transition} the member from {roleLabel[member.role]} to{" "}
            {roleLabel[role]}.
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || isOwner || role === member.role}
          >
            {isLoading ? "Saving..." : "Save role"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
