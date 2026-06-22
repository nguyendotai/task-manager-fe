import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery, getApiErrorMessage } from "@/services/axios-base-query";
import type { Board, BoardColumn } from "@/modules/boards/types";
import type {
  ApiResponse,
  BoardData,
  BoardListData,
  CreateManagedBoardRequest,
  UpdateBoardRequest
} from "@/features/board-management/types";
import { getAllowedMemberId } from "@/features/board-management/utils/board-visibility";

function normalizeColumn(column: BoardColumn, index: number): BoardColumn {
  return {
    ...column,
    id: column.id ?? column._id ?? column.name ?? column.title,
    title: column.title ?? column.name ?? `Column ${index + 1}`,
    order: column.order ?? index,
    tasks: column.tasks ?? []
  };
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
    allowedMembers: (board.allowedMembers ?? [])
      .map(getAllowedMemberId)
      .filter(Boolean),
    columns: board.columns?.map(normalizeColumn)
  };
}

function normalizeBoardList(data: BoardListData): Board[] {
  const boards = Array.isArray(data) ? data : data.boards;
  return boards.map((board) => normalizeBoard(board));
}

export const boardManagementApi = createApi({
  reducerPath: "boardManagementApi",
  baseQuery: axiosBaseQuery,
  tagTypes: ["Board", "WorkspaceBoards"],
  endpoints: (builder) => ({
    getBoardsByWorkspace: builder.query<Board[], string>({
      query: (workspaceId) => ({
        url: `/boards/workspace/${workspaceId}`
      }),
      transformResponse: (response: ApiResponse<BoardListData>) =>
        normalizeBoardList(response.data),
      providesTags: (result, _error, workspaceId) => [
        { type: "WorkspaceBoards", id: workspaceId },
        ...(result ?? []).map((board) => ({
          type: "Board" as const,
          id: board.id
        }))
      ]
    }),
    getBoard: builder.query<Board, string>({
      query: (boardId) => ({
        url: `/boards/${boardId}`
      }),
      transformResponse: (response: ApiResponse<BoardData>) =>
        normalizeBoard(response.data),
      providesTags: (_result, _error, boardId) => [{ type: "Board", id: boardId }]
    }),
    createBoard: builder.mutation<Board, CreateManagedBoardRequest>({
      query: (data) => ({
        url: "/boards",
        method: "POST",
        data: {
          name: data.name,
          workspaceId: data.workspaceId,
          visibility: data.visibility ?? "PUBLIC",
          allowedMembers:
            data.visibility === "PRIVATE" ? data.allowedMembers ?? [] : []
        }
      }),
      transformResponse: (response: ApiResponse<BoardData>) =>
        normalizeBoard(response.data),
      invalidatesTags: (_result, _error, { workspaceId }) => [
        { type: "WorkspaceBoards", id: workspaceId }
      ]
    }),
    updateBoard: builder.mutation<
      Board,
      { boardId: string; workspaceId?: string; data: UpdateBoardRequest }
    >({
      query: ({ boardId, data }) => ({
        url: `/boards/${boardId}`,
        method: "PATCH",
        data: {
          name: data.name,
          visibility: data.visibility,
          allowedMembers:
            data.visibility === "PRIVATE" ? data.allowedMembers ?? [] : []
        }
      }),
      transformResponse: (response: ApiResponse<BoardData>) =>
        normalizeBoard(response.data),
      async onQueryStarted(
        { boardId, workspaceId, data },
        { dispatch, queryFulfilled }
      ) {
        const detailPatch = dispatch(
          boardManagementApi.util.updateQueryData("getBoard", boardId, (draft) => {
            draft.name = data.name;
            draft.visibility = data.visibility;
            draft.allowedMembers =
              data.visibility === "PRIVATE" ? data.allowedMembers ?? [] : [];
          })
        );
        const listPatch = workspaceId
          ? dispatch(
              boardManagementApi.util.updateQueryData(
                "getBoardsByWorkspace",
                workspaceId,
                (draft) => {
                  const board = draft.find((item) => item.id === boardId);

                  if (board) {
                    board.name = data.name;
                    board.visibility = data.visibility;
                    board.allowedMembers =
                      data.visibility === "PRIVATE"
                        ? data.allowedMembers ?? []
                        : [];
                  }
                }
              )
            )
          : null;

        try {
          await queryFulfilled;
        } catch {
          detailPatch.undo();
          listPatch?.undo();
        }
      },
      invalidatesTags: (_result, _error, { boardId, workspaceId }) => [
        { type: "Board", id: boardId },
        ...(workspaceId
          ? [{ type: "WorkspaceBoards" as const, id: workspaceId }]
          : [])
      ]
    }),
    deleteBoard: builder.mutation<
      string,
      { boardId: string; workspaceId?: string }
    >({
      query: ({ boardId }) => ({
        url: `/boards/${boardId}`,
        method: "DELETE"
      }),
      transformResponse: (_response, _meta, { boardId }) => boardId,
      async onQueryStarted({ boardId, workspaceId }, { dispatch, queryFulfilled }) {
        const listPatch = workspaceId
          ? dispatch(
              boardManagementApi.util.updateQueryData(
                "getBoardsByWorkspace",
                workspaceId,
                (draft) => draft.filter((board) => board.id !== boardId)
              )
            )
          : null;

        try {
          await queryFulfilled;
        } catch {
          listPatch?.undo();
        }
      },
      invalidatesTags: (_result, _error, { boardId, workspaceId }) => [
        { type: "Board", id: boardId },
        ...(workspaceId
          ? [{ type: "WorkspaceBoards" as const, id: workspaceId }]
          : [])
      ]
    })
  })
});

export const {
  useCreateBoardMutation,
  useDeleteBoardMutation,
  useGetBoardsByWorkspaceQuery,
  useGetBoardQuery,
  useUpdateBoardMutation
} = boardManagementApi;

export const useGetBoardsByProjectQuery = useGetBoardsByWorkspaceQuery;

export function getBoardManagementError(
  error: unknown,
  fallback = "Board request failed."
) {
  return getApiErrorMessage(error, fallback);
}

export function getPrivateBoardPermissionError(error: unknown) {
  if (error && typeof error === "object" && "status" in error) {
    const status = (error as { status?: number }).status;

    if (status === 403) {
      return "You do not have permission to manage private boards.";
    }
  }

  return getBoardManagementError(
    error,
    "You do not have permission to manage private boards."
  );
}
