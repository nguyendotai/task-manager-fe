import api from "@/services/api";
import type {
  ApiResponse,
  DashboardData,
  DashboardSummary,
  DashboardTask,
  DashboardTaskLabel
} from "@/modules/dashboard/types";
import type { TaskPriority, TaskStatus } from "@/modules/tasks/types";

const defaultSummary: DashboardSummary = {
  workspaces: 0,
  boards: 0,
  tasks: 0,
  completedTasks: 0,
  overdueTasks: 0,
  myTasks: 0,
  markedTasks: 0
};

const defaultTaskStatus: Record<TaskStatus, number> = {
  TODO: 0,
  IN_PROGRESS: 0,
  REVIEW: 0,
  DONE: 0
};

const defaultTaskPriority: Record<TaskPriority, number> = {
  LOW: 0,
  MEDIUM: 0,
  HIGH: 0,
  URGENT: 0
};

function normalizeTask(task: DashboardTask): DashboardTask {
  return {
    ...task,
    id: task.id ?? task._id ?? task.title,
    priority: task.priority ?? "MEDIUM",
    status: task.status ?? "TODO",
    assignees: Array.isArray(task.assignees) ? task.assignees : [],
    labels: Array.isArray(task.labels)
      ? task.labels.map((label) =>
          typeof label === "string"
            ? label
            : ({
                ...label,
                id: label.id ?? label._id ?? label.name,
                color: label.color ?? "#dc2626"
              } satisfies DashboardTaskLabel)
        )
      : []
  };
}

function normalizeDashboard(data: DashboardData): DashboardData {
  return {
    summary: {
      ...defaultSummary,
      ...(data.summary ?? {})
    },
    taskStatus: {
      ...defaultTaskStatus,
      ...(data.taskStatus ?? {})
    },
    taskPriority: {
      ...defaultTaskPriority,
      ...(data.taskPriority ?? {})
    },
    recentTasks: Array.isArray(data.recentTasks)
      ? data.recentTasks.map(normalizeTask)
      : []
  };
}

export const dashboardService = {
  async getDashboard() {
    const response = await api.get<ApiResponse<DashboardData>>("/dashboard");
    return normalizeDashboard(response.data.data);
  }
};
