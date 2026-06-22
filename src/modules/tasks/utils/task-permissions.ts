import type { WorkspaceRole } from "@/features/workspace-members/types";

export function canCreatePrivateTasks(role?: WorkspaceRole | null) {
  return role === "WORKSPACE_OWNER" || role === "WORKSPACE_ADMIN";
}

export function canAssignTasks(role?: WorkspaceRole | null) {
  return role === "WORKSPACE_OWNER" || role === "WORKSPACE_ADMIN";
}

export function canUpdateTasks(role?: WorkspaceRole | null) {
  return (
    role === "WORKSPACE_OWNER" || role === "WORKSPACE_ADMIN" || role === "MEMBER"
  );
}

export function canDeleteTasks(role?: WorkspaceRole | null) {
  return role === "WORKSPACE_OWNER" || role === "WORKSPACE_ADMIN";
}

export function getTaskPermissionMessage(
  operation: "assign" | "private" | "delete" | "edit" | "default"
) {
  const messages = {
    assign: "You do not have permission to assign this task.",
    private: "Only workspace owners/admins can create private tasks.",
    delete: "You do not have permission to delete this task.",
    edit: "You do not have permission to update this task.",
    default: "You do not have permission to manage this task."
  };

  return messages[operation];
}
