import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/modules/auth/store/auth-slice";
import boardsReducer from "@/modules/boards/store/board-slice";
import commentsReducer from "@/modules/comments/store/comment-slice";
import labelsReducer from "@/modules/labels/store/label-slice";
import projectsReducer from "@/modules/projects/store/project-slice";
import tasksReducer from "@/modules/tasks/store/tasks-slice";
import workspacesReducer from "@/modules/workspaces/store/workspace-slice";
import { boardManagementApi } from "@/features/board-management/api/board-management-api";
import { workspaceMembersApi } from "@/features/workspace-members/api/workspace-members-api";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    boards: boardsReducer,
    comments: commentsReducer,
    labels: labelsReducer,
    projects: projectsReducer,
    tasks: tasksReducer,
    workspaces: workspacesReducer,
    [boardManagementApi.reducerPath]: boardManagementApi.reducer,
    [workspaceMembersApi.reducerPath]: workspaceMembersApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      workspaceMembersApi.middleware,
      boardManagementApi.middleware
    )
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
