import type {
  WorkspaceMember,
  WorkspaceRole
} from "@/features/workspace-members/types";
import { canManageTargetRole } from "@/features/workspace-members/utils/role-utils";
import { getUserId } from "@/features/workspace-members/utils/member-selectors";

export function canInviteMembers(role?: WorkspaceRole | null) {
  return role === "WORKSPACE_OWNER" || role === "WORKSPACE_ADMIN";
}

export function canUpdateWorkspace(role?: WorkspaceRole | null) {
  return role === "WORKSPACE_OWNER" || role === "WORKSPACE_ADMIN";
}

export function canDeleteWorkspace(role?: WorkspaceRole | null) {
  return role === "WORKSPACE_OWNER";
}

export function canTransferOwnership(role?: WorkspaceRole | null) {
  return role === "WORKSPACE_OWNER";
}

export function canRemoveMember(role?: WorkspaceRole | null) {
  return role === "WORKSPACE_OWNER" || role === "WORKSPACE_ADMIN";
}

export function canEditMemberRole(
  actor: WorkspaceMember | null,
  target: WorkspaceMember,
  currentUserId: string
) {
  if (!actor) {
    return false;
  }

  const targetUserId = getUserId(target.user);

  if (target.role === "WORKSPACE_OWNER" && actor.role !== "WORKSPACE_OWNER") {
    return false;
  }

  if (
    actor.role === "WORKSPACE_OWNER" &&
    target.role === "WORKSPACE_OWNER" &&
    targetUserId === currentUserId
  ) {
    return false;
  }

  return canManageTargetRole(actor.role, target.role);
}
