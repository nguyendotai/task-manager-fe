import type { User } from "@/types";
import { Label } from "../labels/types";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
export type TaskVisibility = "PUBLIC" | "PRIVATE";
export type TaskAssignee = User | string;

export type Task = {
  id: string;
  _id?: string;
  title: string;
  description?: string;

  board: string;
  boardId?: string;

  column: string;
  columnId?: string;

  workspace: string;
  workspaceId?: string;

  assignees: TaskAssignee[];
  allowedMembers?: string[];

  labels: Label[];

  markedBy?: string[];
  priority: TaskPriority;
  status: TaskStatus;
  visibility?: TaskVisibility;
  dueDate?: string;
  order?: number;

  createdBy?: TaskAssignee;
  isMarked?: boolean;
  marked?: boolean;

  createdAt?: string;
  updatedAt?: string;
};

export type TaskFormValues = {
  title: string;
  description?: string;
  columnId: string;
  assignees: string[];
  allowedMembers?: string[];

  labels: string[];

  priority: TaskPriority;
  status: TaskStatus;
  visibility: TaskVisibility;
  dueDate?: string;
  order?: number;
};

export type CreateTaskRequest = {
  title: string;
  description?: string;
  boardId: string;
  columnId: string;
  workspaceId: string;

  assignees?: string[];
  allowedMembers?: string[];

  labels?: string[];

  priority: TaskPriority;
  status: TaskStatus;
  visibility?: TaskVisibility;
  dueDate?: string;
  order?: number;
};

export type UpdateTaskRequest = Partial<TaskFormValues> & {
  boardId?: string;
  workspaceId?: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type TaskListData =
  | Task[]
  | {
      tasks: Task[];
    };

export type TaskData =
  | Task
  | {
      task: Task;
    };

export type TaskListKind = "my" | "recent" | "marked";
