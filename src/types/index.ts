export type TaskStatus = "backlog" | "todo" | "inProgress" | "review" | "done";

export type User = {
  id: string;
  _id?: string;
  name: string;
  email: string;
  avatar?: string | null;
  avatarFallback?: string;
  role?: "SUPER_ADMIN" | "ADMIN" | "USER";
};

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: "low" | "medium" | "high";
  assignee: User;
  dueDate: string;
  commentsCount: number;
};

export type BoardColumn = {
  id: TaskStatus;
  title: string;
  tone: "slate" | "red" | "amber" | "emerald";
};
