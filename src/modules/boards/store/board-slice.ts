import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { boardService } from "@/modules/boards/services/board-service";
import type { Board, CreateBoardRequest } from "@/modules/boards/types";

type BoardsState = {
  items: Board[];
  selectedBoard: Board | null;
  loading: boolean;
  creating: boolean;
  error: string | null;
  createError: string | null;
};

const initialState: BoardsState = {
  items: [],
  selectedBoard: null,
  loading: false,
  creating: false,
  error: null,
  createError: null
};

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to complete board request.";
}

export const fetchBoardsByWorkspace = createAsyncThunk(
  "boards/fetchByWorkspace",
  async (workspaceId: string, { rejectWithValue }) => {
    try {
      return await boardService.getBoardsByWorkspace(workspaceId);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createBoard = createAsyncThunk(
  "boards/create",
  async (payload: CreateBoardRequest, { rejectWithValue }) => {
    try {
      return await boardService.createBoard(payload);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchBoardById = createAsyncThunk(
  "boards/fetchById",
  async (boardId: string, { rejectWithValue }) => {
    try {
      return await boardService.getBoardById(boardId);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const boardSlice = createSlice({
  name: "boards",
  initialState,
  reducers: {
    clearBoardErrors(state) {
      state.error = null;
      state.createError = null;
    },
    clearSelectedBoard(state) {
      state.selectedBoard = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBoardsByWorkspace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoardsByWorkspace.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchBoardsByWorkspace.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Unable to load boards.";
      })
      .addCase(createBoard.pending, (state) => {
        state.creating = true;
        state.createError = null;
      })
      .addCase(createBoard.fulfilled, (state, action) => {
        state.creating = false;
        state.items.unshift(action.payload);
      })
      .addCase(createBoard.rejected, (state, action) => {
        state.creating = false;
        state.createError =
          typeof action.payload === "string"
            ? action.payload
            : "Unable to create board.";
      })
      .addCase(fetchBoardById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoardById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedBoard = action.payload;
      })
      .addCase(fetchBoardById.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Unable to load board.";
      });
  }
});

export const { clearBoardErrors, clearSelectedBoard } = boardSlice.actions;
export default boardSlice.reducer;
