import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { taskService } from "@/modules/tasks/services/task-service";
import { getTaskPermissionMessage } from "@/modules/tasks/utils/task-permissions";
import type {
  CreateTaskRequest,
  Task,
  TaskListKind,
  UpdateTaskRequest
} from "@/modules/tasks/types";

type TasksState = {
  byColumnId: Record<string, Task[]>;
  loadingByColumnId: Record<string, boolean>;
  errorByColumnId: Record<string, string | null>;
  lists: Record<TaskListKind, Task[]>;
  loadingLists: Record<TaskListKind, boolean>;
  listErrors: Record<TaskListKind, string | null>;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  createError: string | null;
  updateError: string | null;
  deleteError: string | null;
  markError: string | null;
};

const initialState: TasksState = {
  byColumnId: {},
  loadingByColumnId: {},
  errorByColumnId: {},
  lists: {
    my: [],
    recent: [],
    marked: []
  },
  loadingLists: {
    my: false,
    recent: false,
    marked: false
  },
  listErrors: {
    my: null,
    recent: null,
    marked: null
  },
  creating: false,
  updating: false,
  deleting: false,
  createError: null,
  updateError: null,
  deleteError: null,
  markError: null
};

function getErrorMessage(error: unknown, fallback = "Unable to complete task request.") {
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

  return fallback;
}

function getTaskMutationError(
  error: unknown,
  operation: "assign" | "private" | "delete" | "edit" | "default"
) {
  if (axios.isAxiosError(error) && error.response?.status === 403) {
    return getTaskPermissionMessage(operation);
  }

  return getErrorMessage(error);
}

export const fetchTasksByColumn = createAsyncThunk(
  "tasks/fetchByColumn",
  async (columnId: string, { rejectWithValue }) => {
    try {
      const tasks = await taskService.getTasksByColumn(columnId);
      return { columnId, tasks };
    } catch (error) {
      return rejectWithValue({ columnId, message: getErrorMessage(error) });
    }
  }
);

export const createTask = createAsyncThunk(
  "tasks/create",
  async (payload: CreateTaskRequest, { rejectWithValue }) => {
    try {
      return await taskService.createTask(payload);
    } catch (error) {
      const operation =
        payload.visibility === "PRIVATE"
          ? "private"
          : payload.assignees && payload.assignees.length > 0
            ? "assign"
            : "default";
      return rejectWithValue(getTaskMutationError(error, operation));
    }
  }
);

export const fetchTaskList = createAsyncThunk(
  "tasks/fetchList",
  async (kind: TaskListKind, { rejectWithValue }) => {
    try {
      if (kind === "my") {
        return { kind, tasks: await taskService.getMyTasks() };
      }

      if (kind === "recent") {
        return { kind, tasks: await taskService.getRecentTasks() };
      }

      return { kind, tasks: await taskService.getMarkedTasks() };
    } catch (error) {
      return rejectWithValue({ kind, message: getErrorMessage(error) });
    }
  }
);

export const toggleTaskMark = createAsyncThunk(
  "tasks/toggleMark",
  async (
    payload: {
      taskId: string;
      marked: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      return await taskService.toggleTaskMark(payload.taskId, payload.marked);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateTask = createAsyncThunk(
  "tasks/update",
  async (
    payload: { taskId: string; data: UpdateTaskRequest },
    { rejectWithValue }
  ) => {
    try {
      return await taskService.updateTask(payload.taskId, payload.data);
    } catch (error) {
      const operation =
        payload.data.visibility === "PRIVATE"
          ? "private"
          : payload.data.assignees && payload.data.assignees.length > 0
            ? "assign"
            : "edit";
      return rejectWithValue(getTaskMutationError(error, operation));
    }
  }
);

export const deleteTask = createAsyncThunk(
  "tasks/delete",
  async (taskId: string, { rejectWithValue }) => {
    try {
      return await taskService.deleteTask(taskId);
    } catch (error) {
      return rejectWithValue(getTaskMutationError(error, "delete"));
    }
  }
);

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    clearTaskErrors(state) {
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
      state.markError = null;
    },
    clearTasks(state) {
      state.byColumnId = {};
      state.loadingByColumnId = {};
      state.errorByColumnId = {};
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasksByColumn.pending, (state, action) => {
        state.loadingByColumnId[action.meta.arg] = true;
        state.errorByColumnId[action.meta.arg] = null;
      })
      .addCase(fetchTasksByColumn.fulfilled, (state, action) => {
        state.loadingByColumnId[action.payload.columnId] = false;
        state.byColumnId[action.payload.columnId] = action.payload.tasks;
      })
      .addCase(fetchTasksByColumn.rejected, (state, action) => {
        const payload = action.payload as
          | { columnId: string; message: string }
          | undefined;
        const columnId = payload?.columnId ?? action.meta.arg;

        state.loadingByColumnId[columnId] = false;
        state.errorByColumnId[columnId] =
          payload?.message ?? "Unable to load tasks.";
      })
      .addCase(fetchTaskList.pending, (state, action) => {
        state.loadingLists[action.meta.arg] = true;
        state.listErrors[action.meta.arg] = null;
      })
      .addCase(fetchTaskList.fulfilled, (state, action) => {
        state.loadingLists[action.payload.kind] = false;
        state.lists[action.payload.kind] = action.payload.tasks;
      })
      .addCase(fetchTaskList.rejected, (state, action) => {
        const payload = action.payload as
          | { kind: TaskListKind; message: string }
          | undefined;
        const kind = payload?.kind ?? action.meta.arg;
        state.loadingLists[kind] = false;
        state.listErrors[kind] = payload?.message ?? "Unable to load tasks.";
      })
      .addCase(createTask.pending, (state) => {
        state.creating = true;
        state.createError = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.creating = false;
        const columnId = action.payload.columnId ?? action.payload.column;
        const columnTasks = state.byColumnId[columnId] ?? [];
        state.byColumnId[columnId] = [action.payload, ...columnTasks];
      })
      .addCase(createTask.rejected, (state, action) => {
        state.creating = false;
        state.createError =
          typeof action.payload === "string"
            ? action.payload
            : "Unable to create task.";
      })
      .addCase(updateTask.pending, (state) => {
        state.updating = true;
        state.updateError = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.updating = false;

        Object.keys(state.byColumnId).forEach((columnId) => {
          state.byColumnId[columnId] = state.byColumnId[columnId].filter(
            (task) => task.id !== action.payload.id
          );
        });

        const nextColumnId = action.payload.columnId ?? action.payload.column;
        state.byColumnId[nextColumnId] = [
          action.payload,
          ...(state.byColumnId[nextColumnId] ?? [])
        ].sort((first, second) => (first.order ?? 0) - (second.order ?? 0));
        replaceTaskEverywhere(state, action.payload);
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.updating = false;
        state.updateError =
          typeof action.payload === "string"
            ? action.payload
            : "Unable to update task.";
      })
      .addCase(toggleTaskMark.fulfilled, (state, action) => {
        state.markError = null;
        replaceTaskEverywhere(state, action.payload);

        if (!action.payload.isMarked) {
          state.lists.marked = state.lists.marked.filter(
            (task) => task.id !== action.payload.id
          );
        } else if (
          !state.lists.marked.some((task) => task.id === action.payload.id)
        ) {
          state.lists.marked.unshift(action.payload);
        }
      })
      .addCase(toggleTaskMark.rejected, (state, action) => {
        state.markError =
          typeof action.payload === "string"
            ? action.payload
            : "Unable to mark task.";
      })
      .addCase(deleteTask.pending, (state) => {
        state.deleting = true;
        state.deleteError = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.deleting = false;

        Object.keys(state.byColumnId).forEach((columnId) => {
          state.byColumnId[columnId] = state.byColumnId[columnId].filter(
            (task) => task.id !== action.payload
          );
        });
        (Object.keys(state.lists) as TaskListKind[]).forEach((kind) => {
          state.lists[kind] = state.lists[kind].filter(
            (task) => task.id !== action.payload
          );
        });
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.deleting = false;
        state.deleteError =
          typeof action.payload === "string"
            ? action.payload
            : "Unable to delete task.";
      });
  }
});

export const { clearTaskErrors, clearTasks } = tasksSlice.actions;
export default tasksSlice.reducer;

function replaceTaskEverywhere(state: TasksState, task: Task) {
  Object.keys(state.byColumnId).forEach((columnId) => {
    state.byColumnId[columnId] = state.byColumnId[columnId].map((item) =>
      item.id === task.id ? task : item
    );
  });

  (Object.keys(state.lists) as TaskListKind[]).forEach((kind) => {
    state.lists[kind] = state.lists[kind].map((item) =>
      item.id === task.id ? task : item
    );
  });
}
