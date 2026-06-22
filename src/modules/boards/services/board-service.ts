import api from "@/services/api";
import type {
  ApiResponse,
  Board,
  BoardAllowedMember,
  BoardColumn,
  BoardData,
  BoardListData,
  CreateBoardRequest
} from "@/modules/boards/types";

function normalizeColumn(column: BoardColumn, index: number): BoardColumn {
  return {
    ...column,
    id: column.id ?? column._id ?? column.name ?? column.title,
    title: column.title ?? column.name ?? `Column ${index + 1}`,
    order: column.order ?? index,
    tasks: column.tasks ?? []
  };
}

function normalizeAllowedMembers(value: BoardAllowedMember[] | undefined): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((member) => {
      if (typeof member === "string") {
        return member;
      }

      return member.id ?? member._id ?? "";
    })
    .filter(Boolean);
}

function unwrapBoard(data: BoardData): Board {
  return "board" in data ? data.board : data;
}

function normalizeBoard(data: BoardData): Board {
  const board = unwrapBoard(data);

  return {
    ...board,
    id: board.id ?? board._id ?? board.name,
    name: board.name ?? board.title ?? "Untitled board",
    status: board.status ?? "ACTIVE",
    visibility: board.visibility ?? "PUBLIC",
    allowedMembers: normalizeAllowedMembers(board.allowedMembers),
    columns: board.columns?.map(normalizeColumn)
  };
}

function normalizeBoardList(data: BoardListData): Board[] {
  const boards = Array.isArray(data) ? data : data.boards;
  return boards.map(normalizeBoard);
}

export const boardService = {
  async createBoard(payload: CreateBoardRequest) {
    const response = await api.post<ApiResponse<BoardData>>("/boards", payload);
    return normalizeBoard(response.data.data);
  },

  async getBoardsByWorkspace(workspaceId: string) {
    const response = await api.get<ApiResponse<BoardListData>>(
      `/boards/workspace/${workspaceId}`
    );
    return normalizeBoardList(response.data.data);
  },

  async getBoardById(boardId: string) {
    const response = await api.get<ApiResponse<BoardData>>(`/boards/${boardId}`);
    return normalizeBoard(response.data.data);
  }
};
