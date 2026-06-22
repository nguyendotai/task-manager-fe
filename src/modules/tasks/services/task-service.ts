import api from "@/services/api";
import type {
  ApiResponse,
  CreateTaskRequest,
  Task,
  TaskData,
  TaskListData,
  UpdateTaskRequest
} from "@/modules/tasks/types";

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }

      if (item && typeof item === "object" && "id" in item) {
        return String(item.id);
      }

      if (item && typeof item === "object" && "_id" in item) {
        return String(item._id);
      }

      if (item && typeof item === "object" && "name" in item) {
        return String(item.name);
      }

      if (item && typeof item === "object" && "label" in item) {
        return String(item.label);
      }

      return "";
    })
    .filter(Boolean);
}

function unwrapTask(data: TaskData): Task {
  return "task" in data ? data.task : data;
}

function normalizeTask(data: TaskData): Task {
  const task = unwrapTask(data);
  const board = task.board ?? task.boardId ?? "";
  const column = task.column ?? task.columnId ?? "";
  const workspace = task.workspace ?? task.workspaceId ?? "";
  const markedBy = normalizeStringArray(task.markedBy);

  return {
    ...task,
    id: task.id ?? task._id ?? task.title,
    board,
    boardId: task.boardId ?? board,
    column,
    columnId: task.columnId ?? column,
    workspace,
    workspaceId: task.workspaceId ?? workspace,
    assignees: Array.isArray(task.assignees) ? task.assignees : [],
    allowedMembers: normalizeStringArray(task.allowedMembers),
    labels: normalizeStringArray(task.labels),
    markedBy,
    priority: task.priority ?? "MEDIUM",
    status: task.status ?? "TODO",
    visibility: task.visibility ?? "PUBLIC",
    isMarked: task.isMarked ?? task.marked ?? markedBy.length > 0
  };
}

function normalizeTaskList(data: TaskListData): Task[] {
  const tasks = Array.isArray(data) ? data : data.tasks;
  return tasks.map(normalizeTask);
}

export const taskService = {
  async createTask(payload: CreateTaskRequest) {
    const response = await api.post<ApiResponse<TaskData>>("/tasks", payload);
    return normalizeTask(response.data.data);
  },

  async getTasksByColumn(columnId: string) {
    const response = await api.get<ApiResponse<TaskListData>>(
      `/tasks/column/${columnId}`
    );
    return normalizeTaskList(response.data.data);
  },

  async getMyTasks() {
    const response = await api.get<ApiResponse<TaskListData>>("/tasks/my");
    return normalizeTaskList(response.data.data);
  },

  async getRecentTasks() {
    const response = await api.get<ApiResponse<TaskListData>>("/tasks/recent");
    return normalizeTaskList(response.data.data);
  },

  async getMarkedTasks() {
    const response = await api.get<ApiResponse<TaskListData>>("/tasks/marked");
    return normalizeTaskList(response.data.data);
  },

  async toggleTaskMark(taskId: string, marked: boolean) {
    const response = await api.patch<ApiResponse<TaskData>>(
      `/tasks/${taskId}/mark`,
      { marked }
    );
    return normalizeTask(response.data.data);
  },

  async updateTask(taskId: string, payload: UpdateTaskRequest) {
    const response = await api.patch<ApiResponse<TaskData>>(
      `/tasks/${taskId}`,
      payload
    );
    return normalizeTask(response.data.data);
  },

  async deleteTask(taskId: string) {
    await api.delete<ApiResponse<Record<string, never>>>(`/tasks/${taskId}`);
    return taskId;
  }
};
