import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { projectService } from "@/modules/projects/services/project-service";
import type { CreateProjectRequest, Project } from "@/modules/projects/types";

type ProjectsState = {
  items: Project[];
  selectedProject: Project | null;
  loading: boolean;
  creating: boolean;
  error: string | null;
  createError: string | null;
};

const initialState: ProjectsState = {
  items: [],
  selectedProject: null,
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

  return "Unable to complete project request.";
}

export const fetchProjectsByWorkspace = createAsyncThunk(
  "projects/fetchByWorkspace",
  async (workspaceId: string, { rejectWithValue }) => {
    try {
      return await projectService.getProjectsByWorkspace(workspaceId);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createProject = createAsyncThunk(
  "projects/create",
  async (payload: CreateProjectRequest, { rejectWithValue }) => {
    try {
      return await projectService.createProject(payload);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchProjectById = createAsyncThunk(
  "projects/fetchById",
  async (projectId: string, { rejectWithValue }) => {
    try {
      return await projectService.getProjectById(projectId);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    clearProjectErrors(state) {
      state.error = null;
      state.createError = null;
    },
    clearSelectedProject(state) {
      state.selectedProject = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjectsByWorkspace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectsByWorkspace.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProjectsByWorkspace.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Unable to load projects.";
      })
      .addCase(createProject.pending, (state) => {
        state.creating = true;
        state.createError = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.creating = false;
        state.items.unshift(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.creating = false;
        state.createError =
          typeof action.payload === "string"
            ? action.payload
            : "Unable to create project.";
      })
      .addCase(fetchProjectById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProject = action.payload;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Unable to load project.";
      });
  }
});

export const { clearProjectErrors, clearSelectedProject } = projectSlice.actions;
export default projectSlice.reducer;
