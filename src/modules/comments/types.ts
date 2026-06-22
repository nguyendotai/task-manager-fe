import type { User } from "@/types";

export type CommentUser = User | string;

export type Comment = {
  id: string;
  _id?: string;
  content: string;
  task: string;
  user: CommentUser;
  attachments: string[];
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateCommentRequest = {
  content: string;
  taskId: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type CommentListData =
  | Comment[]
  | {
      comments: Comment[];
    };

export type CommentData =
  | Comment
  | {
      comment: Comment;
    };
