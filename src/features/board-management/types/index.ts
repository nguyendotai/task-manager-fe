import type { Board, BoardVisibility } from "@/modules/boards/types";

export type CreateManagedBoardRequest = {
  name: string;
  workspaceId: string;
  visibility?: BoardVisibility;
  allowedMembers?: string[];
};

export type UpdateBoardRequest = {
  name: string;
  visibility: BoardVisibility;
  allowedMembers?: string[];
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type BoardData =
  | Board
  | {
      board: Board;
    };

export type BoardListData =
  | Board[]
  | {
      boards: Board[];
    };
