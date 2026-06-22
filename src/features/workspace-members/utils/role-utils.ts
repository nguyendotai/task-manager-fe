import type { WorkspaceRole } from "@/features/workspace-members/types";

type BadgeTone = "red" | "gray" | "blue" | "green" | "amber" | "darkRed";

export const workspaceRoles: WorkspaceRole[] = [
  "WORKSPACE_OWNER",
  "WORKSPACE_ADMIN",
  "MEMBER",
  "GUEST"
];

export const inviteRoles: Exclude<WorkspaceRole, "WORKSPACE_OWNER">[] = [
  "WORKSPACE_ADMIN",
  "MEMBER",
  "GUEST"
];

export const roleRank: Record<WorkspaceRole, number> = {
  WORKSPACE_OWNER: 4,
  WORKSPACE_ADMIN: 3,
  MEMBER: 2,
  GUEST: 1
};

export const roleLabel: Record<WorkspaceRole, string> = {
  WORKSPACE_OWNER: "Owner",
  WORKSPACE_ADMIN: "Admin",
  MEMBER: "Member",
  GUEST: "Guest"
};

export const roleDescription: Record<WorkspaceRole, string> = {
  WORKSPACE_OWNER: "Full workspace control including ownership transfer.",
  WORKSPACE_ADMIN: "Can manage projects, boards, tasks, labels, and members.",
  MEMBER: "Can work on assigned workspace resources.",
  GUEST: "Read-limited access based on visibility and assignment."
};

export const roleTone: Record<WorkspaceRole, BadgeTone> = {
  WORKSPACE_OWNER: "darkRed",
  WORKSPACE_ADMIN: "blue",
  MEMBER: "green",
  GUEST: "gray"
};

export function canAssignRole(
  actorRole: WorkspaceRole | null | undefined,
  targetRole: WorkspaceRole
) {
  if (!actorRole) {
    return false;
  }

  if (actorRole === "WORKSPACE_OWNER") {
    return targetRole !== "WORKSPACE_OWNER";
  }

  return roleRank[targetRole] < roleRank[actorRole];
}

export function canManageTargetRole(
  actorRole: WorkspaceRole | null | undefined,
  targetRole: WorkspaceRole
) {
  if (!actorRole) {
    return false;
  }

  if (actorRole === "WORKSPACE_OWNER") {
    return true;
  }

  return roleRank[targetRole] < roleRank[actorRole];
}
