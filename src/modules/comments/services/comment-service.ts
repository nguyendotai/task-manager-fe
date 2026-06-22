import api from "@/services/api";
import type {
  ApiResponse,
  Comment,
  CommentData,
  CommentListData,
  CreateCommentRequest
} from "@/modules/comments/types";

function unwrapComment(data: CommentData): Comment {
  return "comment" in data ? data.comment : data;
}

function normalizeComment(data: CommentData): Comment {
  const comment = unwrapComment(data);

  return {
    ...comment,
    id: comment.id ?? comment._id ?? `${comment.task}-${comment.createdAt}`,
    attachments: Array.isArray(comment.attachments) ? comment.attachments : []
  };
}

function normalizeCommentList(data: CommentListData): Comment[] {
  const comments = Array.isArray(data) ? data : data.comments;
  return comments.map(normalizeComment);
}

export const commentService = {
  async createComment(payload: CreateCommentRequest) {
    const response = await api.post<ApiResponse<CommentData>>(
      "/comments",
      payload
    );
    return normalizeComment(response.data.data);
  },

  async getCommentsByTask(taskId: string) {
    const response = await api.get<ApiResponse<CommentListData>>(
      `/comments/task/${taskId}`
    );
    return normalizeCommentList(response.data.data);
  }
};
