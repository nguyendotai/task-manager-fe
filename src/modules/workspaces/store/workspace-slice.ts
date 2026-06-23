import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { workspaceService } from "@/modules/workspaces/services/workspace-service";
import type {
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  Workspace
} from "@/modules/workspaces/types";

type WorkspacesState = {
  items: Workspace[];
  selectedWorkspace: Workspace | null;
  loading: boolean;
  creating: boolean;
  error: string | null;
};

const initialState: WorkspacesState = {
  items: [],
  selectedWorkspace: null,
  loading: false,
  creating: false,
  error: null
};

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to complete workspace request.";
}

export const fetchWorkspaces = createAsyncThunk(
  "workspaces/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await workspaceService.getWorkspaces();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createWorkspace = createAsyncThunk(
  "workspaces/create",
  async (payload: CreateWorkspaceRequest, { rejectWithValue }) => {
    try {
      return await workspaceService.createWorkspace(payload);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchWorkspaceById = createAsyncThunk(
  "workspaces/fetchById",
  async (workspaceId: string, { rejectWithValue }) => {
    try {
      return await workspaceService.getWorkspaceById(workspaceId);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateWorkspace = createAsyncThunk(
  "workspaces/update",
  async (
    payload: { workspaceId: string; data: UpdateWorkspaceRequest },
    { rejectWithValue }
  ) => {
    try {
      return await workspaceService.updateWorkspace(
        payload.workspaceId,
        payload.data
      );
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteWorkspace = createAsyncThunk(
  "workspaces/delete",
  async (workspaceId: string, { rejectWithValue }) => {
    try {
      return await workspaceService.deleteWorkspace(workspaceId);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);


const workspaceSlice = createSlice({
  name: "workspaces",
  initialState,
  reducers: {
    clearWorkspaceError(state) {
      state.error = null;
    },
    clearSelectedWorkspace(state) {
      state.selectedWorkspace = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkspaces.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkspaces.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.filter((workspace) => !workspace.isDeleted);
      })
      .addCase(fetchWorkspaces.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Unable to load workspaces.";
      })
      .addCase(createWorkspace.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createWorkspace.fulfilled, (state, action) => {
        state.creating = false;
        state.items.unshift(action.payload);
      })
      .addCase(createWorkspace.rejected, (state, action) => {
        state.creating = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Unable to create workspace.";
      })
      .addCase(fetchWorkspaceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkspaceById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedWorkspace = action.payload;
      })
      .addCase(fetchWorkspaceById.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Unable to load workspace.";
      })
      .addCase(updateWorkspace.fulfilled, (state, action) => {
        state.items = state.items.map((workspace) =>
          workspace.id === action.payload.id ? action.payload : workspace
        );
        state.selectedWorkspace = action.payload;
      })
      .addCase(deleteWorkspace.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (workspace) => workspace.id !== action.payload
        );

        if (state.selectedWorkspace?.id === action.payload) {
          state.selectedWorkspace = null;
        }
      });
  }
});

export const { clearSelectedWorkspace, clearWorkspaceError } =
  workspaceSlice.actions;
export default workspaceSlice.reducer;
