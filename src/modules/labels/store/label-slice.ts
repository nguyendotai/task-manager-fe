import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { labelService } from "@/modules/labels/services/label-service";
import type {
  CreateLabelRequest,
  Label,
  UpdateLabelRequest
} from "@/modules/labels/types";

type LabelsState = {
  items: Label[];
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  error: string | null;
  mutationError: string | null;
};

const initialState: LabelsState = {
  items: [],
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  error: null,
  mutationError: null
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

  return "Unable to complete label request.";
}

export const fetchLabelsByWorkspace = createAsyncThunk(
  "labels/fetchByWorkspace",
  async (workspaceId: string, { rejectWithValue }) => {
    try {
      return await labelService.getLabelsByWorkspace(workspaceId);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createLabel = createAsyncThunk(
  "labels/create",
  async (payload: CreateLabelRequest, { rejectWithValue }) => {
    try {
      return await labelService.createLabel(payload);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateLabel = createAsyncThunk(
  "labels/update",
  async (
    payload: { labelId: string; data: UpdateLabelRequest },
    { rejectWithValue }
  ) => {
    try {
      return await labelService.updateLabel(payload.labelId, payload.data);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteLabel = createAsyncThunk(
  "labels/delete",
  async (labelId: string, { rejectWithValue }) => {
    try {
      return await labelService.deleteLabel(labelId);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const labelSlice = createSlice({
  name: "labels",
  initialState,
  reducers: {
    clearLabelErrors(state) {
      state.error = null;
      state.mutationError = null;
    },
    clearLabels(state) {
      state.items = [];
      state.error = null;
      state.mutationError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLabelsByWorkspace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLabelsByWorkspace.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchLabelsByWorkspace.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Unable to load labels.";
      })
      .addCase(createLabel.pending, (state) => {
        state.creating = true;
        state.mutationError = null;
      })
      .addCase(createLabel.fulfilled, (state, action) => {
        state.creating = false;
        state.items.unshift(action.payload);
      })
      .addCase(createLabel.rejected, (state, action) => {
        state.creating = false;
        state.mutationError =
          typeof action.payload === "string"
            ? action.payload
            : "Unable to create label.";
      })
      .addCase(updateLabel.pending, (state) => {
        state.updating = true;
        state.mutationError = null;
      })
      .addCase(updateLabel.fulfilled, (state, action) => {
        state.updating = false;
        state.items = state.items.map((label) =>
          label.id === action.payload.id ? action.payload : label
        );
      })
      .addCase(updateLabel.rejected, (state, action) => {
        state.updating = false;
        state.mutationError =
          typeof action.payload === "string"
            ? action.payload
            : "Unable to update label.";
      })
      .addCase(deleteLabel.pending, (state) => {
        state.deleting = true;
        state.mutationError = null;
      })
      .addCase(deleteLabel.fulfilled, (state, action) => {
        state.deleting = false;
        state.items = state.items.filter((label) => label.id !== action.payload);
      })
      .addCase(deleteLabel.rejected, (state, action) => {
        state.deleting = false;
        state.mutationError =
          typeof action.payload === "string"
            ? action.payload
            : "Unable to delete label.";
      });
  }
});

export const { clearLabelErrors, clearLabels } = labelSlice.actions;
export default labelSlice.reducer;
