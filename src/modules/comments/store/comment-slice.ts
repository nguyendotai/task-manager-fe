import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { commentService } from "@/modules/comments/services/comment-service";
import type { Comment, CreateCommentRequest } from "@/modules/comments/types";

type CommentsState = {
  byTaskId: Record<string, Comment[]>;
  loadingByTaskId: Record<string, boolean>;
  errorByTaskId: Record<string, string | null>;
  creating: boolean;
  createError: string | null;
};

const initialState: CommentsState = {
  byTaskId: {},
  loadingByTaskId: {},
  errorByTaskId: {},
  creating: false,
  createError: null
};

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ message?: string | string[] }>(error)) {
    const message = error.response?.data?.message;

    if (Array.isArray(message)) {
      return message.join(", ");
    }

    return message ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to complete comment request.";
}

export const fetchCommentsByTask = createAsyncThunk(
  "comments/fetchByTask",
  async (taskId: string, { rejectWithValue }) => {
    try {
      const comments = await commentService.getCommentsByTask(taskId);
      return { taskId, comments };
    } catch (error) {
      return rejectWithValue({ taskId, message: getErrorMessage(error) });
    }
  }
);

export const createComment = createAsyncThunk(
  "comments/create",
  async (payload: CreateCommentRequest, { rejectWithValue }) => {
    try {
      const comment = await commentService.createComment(payload);
      return { taskId: payload.taskId, comment };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const commentSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    clearCommentErrors(state) {
      state.createError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCommentsByTask.pending, (state, action) => {
        state.loadingByTaskId[action.meta.arg] = true;
        state.errorByTaskId[action.meta.arg] = null;
      })
      .addCase(fetchCommentsByTask.fulfilled, (state, action) => {
        state.loadingByTaskId[action.payload.taskId] = false;
        state.byTaskId[action.payload.taskId] = action.payload.comments;
      })
      .addCase(fetchCommentsByTask.rejected, (state, action) => {
        const payload = action.payload as
          | { taskId: string; message: string }
          | undefined;
        const taskId = payload?.taskId ?? action.meta.arg;

        state.loadingByTaskId[taskId] = false;
        state.errorByTaskId[taskId] =
          payload?.message ?? "Unable to load comments.";
      })
      .addCase(createComment.pending, (state) => {
        state.creating = true;
        state.createError = null;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.creating = false;
        state.byTaskId[action.payload.taskId] = [
          ...(state.byTaskId[action.payload.taskId] ?? []),
          action.payload.comment
        ];
      })
      .addCase(createComment.rejected, (state, action) => {
        state.creating = false;
        state.createError =
          typeof action.payload === "string"
            ? action.payload
            : "Unable to create comment.";
      });
  }
});

export const { clearCommentErrors } = commentSlice.actions;
export default commentSlice.reducer;
