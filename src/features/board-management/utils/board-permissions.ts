import type { WorkspaceRole } from "@/features/workspace-members/types";

export function canManageBoards(role?: WorkspaceRole | null) {
  return role === "WORKSPACE_OWNER" || role === "WORKSPACE_ADMIN";
}

export function canManageBoardVisibility(role?: WorkspaceRole | null) {
  return role === "WORKSPACE_OWNER" || role === "WORKSPACE_ADMIN";
}

export function canDeleteBoards(role?: WorkspaceRole | null) {
  return role === "WORKSPACE_OWNER" || role === "WORKSPACE_ADMIN";
}
