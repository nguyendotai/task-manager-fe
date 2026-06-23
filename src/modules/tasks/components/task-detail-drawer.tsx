"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  Inbox,
  LockKeyhole,
  MessageSquareText,
  Send,
  UserRound,
  X,
} from "lucide-react";
import {
  Button,
  EmptyState,
  ErrorState,
  PriorityBadge,
  Skeleton,
  StatusBadge,
  Textarea,
} from "@/components/ui";
import { MemberAvatar } from "@/features/workspace-members/components/member-avatar";
import { RoleBadge } from "@/features/workspace-members/components/role-badge";
import type {
  WorkspaceMember,
  WorkspaceRole,
} from "@/features/workspace-members/types";
import {
  getMemberEmail,
  getMemberName,
  getUserId,
} from "@/features/workspace-members/utils/member-selectors";
import {
  clearCommentErrors,
  createComment,
  fetchCommentsByTask,
} from "@/modules/comments/store/comment-slice";
import type { CommentUser } from "@/modules/comments/types";
import type { Label } from "@/modules/labels/types";
import { TaskVisibilityBadge } from "@/modules/tasks/components/task-visibility-badge";
import { getAssigneeLabel } from "@/modules/tasks/components/task-card";
import type { Task } from "@/modules/tasks/types";
import { canUpdateTasks } from "@/modules/tasks/utils/task-permissions";
import { getTaskMemberId } from "@/modules/tasks/utils/task-visibility";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

type TaskDetailDrawerProps = {
  task: Task | null;
  labelsById?: Record<string, Label>;
  members?: WorkspaceMember[];
  actorRole?: WorkspaceRole | null;
  onClose: () => void;
};

export function TaskDetailDrawer({
  task,
  labelsById = {},
  members = [],
  actorRole = null,
  onClose,
}: TaskDetailDrawerProps) {
  const dispatch = useAppDispatch();
  const [content, setContent] = useState("");
  const { byTaskId, loadingByTaskId, errorByTaskId, creating, createError } =
    useAppSelector((state) => state.comments);
  const comments = task ? (byTaskId[task.id] ?? []) : [];
  const loading = task ? (loadingByTaskId[task.id] ?? false) : false;
  const error = task ? (errorByTaskId[task.id] ?? null) : null;
  const readonly = !canUpdateTasks(actorRole);
  const membersByUserId = new Map(
    members.map((member) => [getUserId(member.user), member]),
  );

  useEffect(() => {
    if (!task) {
      return;
    }

    dispatch(clearCommentErrors());
    dispatch(fetchCommentsByTask(task.id));
    setContent("");
  }, [dispatch, task]);

  if (!task) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (readonly || !task || content.trim().length === 0) {
      return;
    }

    const result = await dispatch(
      createComment({
        taskId: task.id,
        content: content.trim(),
      }),
    );

    if (createComment.fulfilled.match(result)) {
      setContent("");
    }
  }

  return (
    <div className="fixed inset-0 z-[90]">
      <button
        type="button"
        aria-label="Close task detail drawer"
        onClick={onClose}
        className="absolute inset-0 bg-black/35 backdrop-blur-sm"
      />

      <aside className="absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col border-l border-gray-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        <header className="border-b border-gray-100 p-5 dark:border-zinc-800">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <PriorityBadge priority={task.priority} />
                <StatusBadge status={task.status} />
                <TaskVisibilityBadge task={task} />
                {readonly ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900/70">
                    <LockKeyhole className="size-3.5" />
                    Readonly
                  </span>
                ) : null}
              </div>
              <h2 className="mt-4 text-2xl font-bold leading-8 text-gray-950 dark:text-zinc-50">
                {task.title}
              </h2>
            </div>
            <button
              type="button"
              aria-label="Close drawer"
              onClick={onClose}
              className="grid size-10 shrink-0 place-items-center rounded-2xl border border-gray-200 text-gray-500 transition hover:bg-gray-50 hover:text-gray-950 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
            >
              <X className="size-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-5">
          <section className="space-y-5">
            <div>
              <p className="text-sm font-bold text-gray-950 dark:text-zinc-50">
                Description
              </p>
              <p className="mt-2 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm leading-6 text-gray-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                {task.description || "No description has been added."}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <InfoCard
                icon={
                  <CalendarDays className="size-4 text-blue-600 dark:text-blue-500" />
                }
                label="Due date"
                value={
                  task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString()
                    : "No due date"
                }
              />
              <InfoCard
                icon={
                  <UserRound className="size-4 text-blue-600 dark:text-blue-500" />
                }
                label="Assignees"
                value={
                  task.assignees.length > 0
                    ? task.assignees.map(getAssigneeLabel).join(", ")
                    : "Unassigned"
                }
              />
            </div>

            <div>
              <p className="text-sm font-bold text-gray-950 dark:text-zinc-50">
                Assignee access
              </p>
              <div className="mt-2 space-y-2">
                {task.assignees.length === 0 ? (
                  <span className="text-sm font-semibold text-gray-400">
                    Unassigned
                  </span>
                ) : null}
                {task.assignees.map((assignee, index) => {
                  const member = membersByUserId.get(getTaskMemberId(assignee));
                  const label = member
                    ? getMemberName(member)
                    : getAssigneeLabel(assignee);

                  return (
                    <div
                      key={`${label}-${index}`}
                      className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3 dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      {member ? (
                        <MemberAvatar member={member} size="sm" />
                      ) : (
                        <span className="grid size-9 place-items-center rounded-2xl bg-gray-950 text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-950">
                          {getInitials(label)}
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-gray-800 dark:text-zinc-100">
                          {label}
                        </span>
                        {member ? (
                          <span className="block truncate text-xs font-semibold text-gray-500 dark:text-zinc-400">
                            {getMemberEmail(member) || "No email"}
                          </span>
                        ) : null}
                      </span>
                      {member ? <RoleBadge role={member.role} /> : null}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-gray-950 dark:text-zinc-50">
                Labels
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {task.labels.length === 0 ? (
                  <span className="text-sm font-semibold text-gray-400">
                    No labels
                  </span>
                ) : null}
                {task.labels.map((label) => (
                  <span
                    key={label.id}
                    className="rounded-full px-3 py-1 text-xs font-bold text-white"
                    style={{ backgroundColor: label.color }}
                  >
                    {label.name}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-500">
                  <MessageSquareText className="size-4" />
                  Comments
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
                  Collaborate on this task.
                </p>
              </div>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500 dark:bg-zinc-900 dark:text-zinc-400">
                {comments.length}
              </span>
            </div>

            {loading ? (
              <div className="mt-5 space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-20 rounded-2xl" />
                ))}
              </div>
            ) : null}

            {!loading && error ? (
              <ErrorState
                className="mt-5"
                title="Unable to load comments"
                message={error}
                onRetry={() => task && dispatch(fetchCommentsByTask(task.id))}
              />
            ) : null}

            {!loading && !error ? (
              <div className="mt-5 space-y-3">
                {comments.length === 0 ? (
                  <EmptyState
                    icon={<Inbox className="size-7" />}
                    title="No comments yet"
                    description="Add the first comment to start the task discussion."
                  />
                ) : null}

                {comments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} />
                ))}
              </div>
            ) : null}
          </section>
        </div>

        <form
          onSubmit={handleSubmit}
          className="border-t border-gray-100 p-4 dark:border-zinc-800"
        >
          {createError ? (
            <div className="mb-3 flex gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{createError}</span>
            </div>
          ) : null}
          <div className="flex gap-3">
            <Textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={2}
              className="min-h-12 flex-1"
              placeholder={readonly ? "Readonly task" : "Add a comment..."}
              disabled={readonly}
            />
            <Button
              type="submit"
              disabled={readonly || creating || content.trim().length === 0}
              size="icon"
              className="size-12 shrink-0"
              aria-label="Add comment"
            >
              <Send className="size-5" />
            </Button>
          </div>
        </form>
      </aside>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="flex items-center gap-2 text-sm font-bold text-gray-950 dark:text-zinc-50">
        {icon}
        {label}
      </p>
      <p className="mt-2 truncate text-sm text-gray-500 dark:text-zinc-400">
        {value}
      </p>
    </div>
  );
}

function CommentItem({
  comment,
}: {
  comment: {
    content: string;
    user: CommentUser;
    createdAt?: string;
  };
}) {
  const userName =
    typeof comment.user === "string" ? "User" : (comment.user.name ?? "User");
  const userEmail =
    typeof comment.user === "string" ? "" : (comment.user.email ?? "");

  return (
    <article className="flex gap-3 rounded-2xl border border-gray-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gray-950 text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-950">
        {getInitials(userName)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-bold text-gray-950 dark:text-zinc-50">
            {userName}
          </p>
          {userEmail ? (
            <p className="text-xs text-gray-400 dark:text-zinc-500">
              {userEmail}
            </p>
          ) : null}
          <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500">
            {comment.createdAt
              ? new Date(comment.createdAt).toLocaleString()
              : "Just now"}
          </p>
        </div>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600 dark:text-zinc-300">
          {comment.content}
        </p>
      </div>
    </article>
  );
}

function getInitials(label: string) {
  return label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
