import type { TaskPriority, TaskStatus } from "@/modules/tasks/types";
import type { User } from "@/types";

export type DashboardSummary = {
  workspaces: number;
  boards: number;
  tasks: number;
  completedTasks: number;
  overdueTasks: number;
  myTasks: number;
  markedTasks: number;
};

export type DashboardRelatedEntity = {
  id?: string;
  _id?: string;
  name?: string;
};

export type DashboardTaskLabel = {
  id?: string;
  _id?: string;
  name: string;
  color: string;
};

export type DashboardTask = {
  id: string;
  _id?: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  workspace?: DashboardRelatedEntity | string;
  board?: DashboardRelatedEntity | string;
  assignees?: Array<User | string>;
  labels?: Array<DashboardTaskLabel | string>;
  createdAt?: string;
};

export type DashboardData = {
  summary: DashboardSummary;
  taskStatus: Record<TaskStatus, number>;
  taskPriority?: Record<TaskPriority, number>;
  recentTasks: DashboardTask[];
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};
