import type { Workspace } from "@/modules/workspaces/types";
import type { User } from "@/types";

export type BoardStatus = "ACTIVE" | "ARCHIVED";
export type BoardVisibility = "PUBLIC" | "PRIVATE";
export type BoardWorkspace = Workspace | string;
export type BoardCreator = User | string;
export type BoardAllowedMember = User | string;

export type BoardColumn = {
  id: string;
  _id?: string;
  title: string;
  name?: string;
  order?: number;
  tasks?: unknown[];
};

export type Board = {
  id: string;
  _id?: string;
  name: string;
  title?: string;
  description?: string;
  workspace: BoardWorkspace;
  workspaceId?: string;
  createdBy?: BoardCreator;
  status: BoardStatus;
  visibility?: BoardVisibility;
  allowedMembers?: BoardAllowedMember[];
  columns?: BoardColumn[];
  createdAt?: string;
  updatedAt?: string;
};

export type CreateBoardRequest = {
  name: string;
  workspaceId: string;
  visibility?: BoardVisibility;
  allowedMembers?: string[];
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type BoardListData =
  | Board[]
  | {
      boards: Board[];
    };

export type BoardData =
  | Board
  | {
      board: Board;
    };
