"use client";

import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import type { WorkspaceMember } from "@/features/workspace-members/types";
import {
  findCurrentWorkspaceMember,
  getUserId
} from "@/features/workspace-members/utils/member-selectors";
import {
  canDeleteWorkspace,
  canInviteMembers,
  canRemoveMember,
  canTransferOwnership,
  canUpdateWorkspace
} from "@/features/workspace-members/utils/permission-helpers";

export function useWorkspaceMemberPermissions(members: WorkspaceMember[]) {
  const user = useAppSelector((state) => state.auth.user);

  return useMemo(() => {
    const currentMember = findCurrentWorkspaceMember(members, user);
    const role = currentMember?.role ?? null;
    const currentUserId = getUserId(user);

    return {
      currentMember,
      currentUserId,
      role,
      canInvite: canInviteMembers(role),
      canUpdateWorkspace: canUpdateWorkspace(role),
      canDeleteWorkspace: canDeleteWorkspace(role),
      canRemoveMembers: canRemoveMember(role),
      canTransferOwnership: canTransferOwnership(role)
    };
  }, [members, user]);
}
