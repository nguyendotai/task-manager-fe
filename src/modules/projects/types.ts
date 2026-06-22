import type { User } from "@/types";
import type { Workspace } from "@/modules/workspaces/types";

export type ProjectStatus = "ACTIVE" | "ARCHIVED" | "COMPLETED";

export type ProjectWorkspace = Workspace | string;
export type ProjectCreator = User | string;

export type Project = {
  id: string;
  _id?: string;
  name: string;
  description?: string;
  workspace: ProjectWorkspace;
  createdBy?: ProjectCreator;
  status: ProjectStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateProjectRequest = {
  name: string;
  description?: string;
  workspaceId: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type ProjectListData =
  | Project[]
  | {
      projects: Project[];
    };

export type ProjectData =
  | Project
  | {
      project: Project;
    };
