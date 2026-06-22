import type { User } from "@/types";
import type { Workspace } from "@/modules/workspaces/types";

export type WorkspaceRole =
  | "WORKSPACE_OWNER"
  | "WORKSPACE_ADMIN"
  | "MEMBER"
  | "GUEST";

export type WorkspaceMemberUser = User & {
  avatar?: string | null;
};

export type WorkspaceMember = {
  id: string;
  _id?: string;
  workspace?: string | Workspace;
  user: WorkspaceMemberUser;
  role: WorkspaceRole;
  joinedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type InvitationRole = Exclude<WorkspaceRole, "WORKSPACE_OWNER">;

export type WorkspaceInvitation = {
  id: string;
  _id?: string;
  workspace: string;
  email: string;
  role: InvitationRole;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  token?: string;
  expiresAt?: string;
  createdAt?: string;
};

export type InviteMemberRequest = {
  email: string;
  role: InvitationRole;
};

export type UpdateMemberRoleRequest = {
  role: InvitationRole;
};

export type WorkspaceSettingsRequest = {
  name: string;
  description?: string;
  logo?: string | null;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type WorkspaceMembersData =
  | WorkspaceMember[]
  | {
      members?: WorkspaceMember[];
      workspaceMembers?: WorkspaceMember[];
      items?: WorkspaceMember[];
    };

export type WorkspaceMemberData =
  | WorkspaceMember
  | {
      member: WorkspaceMember;
    };

export type WorkspaceInvitationData =
  | WorkspaceInvitation
  | {
      invitation: WorkspaceInvitation;
    };

export type WorkspaceData =
  | Workspace
  | {
      workspace: Workspace;
    };
