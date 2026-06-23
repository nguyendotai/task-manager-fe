import type { User } from "@/types";

export type WorkspaceOwner = User | string;
export type WorkspaceMembership = {
  id?: string;
  _id?: string;
  workspace?: Workspace | null;
  role?: "WORKSPACE_OWNER" | "WORKSPACE_ADMIN" | "MEMBER" | "GUEST";
  joinedAt?: string;
};

export type Workspace = {
  id: string;
  _id?: string;
  name: string;
  description?: string;
  owner?: WorkspaceOwner;
  slug: string;
  logo?: string | null;
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateWorkspaceRequest = {
  name: string;
  description?: string;
};

export type UpdateWorkspaceRequest = Partial<CreateWorkspaceRequest> & {
  slug?: string;
  logo?: string | null;
  isDeleted?: boolean;
};

export type WorkspaceMember = {
  id: string;
  _id?: string;
  role: "WORKSPACE_OWNER" | "WORKSPACE_ADMIN" | "MEMBER" | "GUEST";
  joinedAt?: string;
  user: User;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type WorkspaceListData =
  | Array<Workspace | WorkspaceMembership | null>
  | {
      workspaces: Array<Workspace | WorkspaceMembership | null>;
    };
