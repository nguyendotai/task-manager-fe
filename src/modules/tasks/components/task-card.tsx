"use client";

import { CalendarDays, Pencil, Star, Trash2 } from "lucide-react";
import { PriorityBadge } from "@/components/ui";
import { MemberAvatar } from "@/features/workspace-members/components/member-avatar";
import type { WorkspaceMember } from "@/features/workspace-members/types";
import {
  getMemberName,
  getUserId,
} from "@/features/workspace-members/utils/member-selectors";
import { cn } from "@/lib/utils";
import type { Label } from "@/modules/labels/types";
import { TaskVisibilityBadge } from "@/modules/tasks/components/task-visibility-badge";
import type { Task, TaskAssignee } from "@/modules/tasks/types";
import { getTaskMemberId } from "@/modules/tasks/utils/task-visibility";

type TaskCardProps = {
  task: Task;
  labelsById?: Record<string, Label>;
  members?: WorkspaceMember[];
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onToggleMark?: (task: Task) => void;
  onOpenDetail?: (task: Task) => void;
};

export function TaskCard({
  task,
  labelsById = {},
  members = [],
  onEdit,
  onDelete,
  onToggleMark,
  onOpenDetail,
}: TaskCardProps) {
  const membersByUserId = new Map(
    members.map((member) => [getUserId(member.user), member]),
  );
  const assignees = task.assignees.length > 0 ? task.assignees : ["Unassigned"];

  return (
    <article
      role={onOpenDetail ? "button" : undefined}
      tabIndex={onOpenDetail ? 0 : undefined}
      onClick={() => onOpenDetail?.(task)}
      onKeyDown={(event) => {
        if (!onOpenDetail) {
          return;
        }

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenDetail(task);
        }
      }}
      className={cn(
        "rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-soft dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-900/70",
        onOpenDetail && "cursor-pointer",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <PriorityBadge priority={task.priority} />
          <TaskVisibilityBadge task={task} />
        </div>

        <div className="flex gap-1">
          {onToggleMark ? (
            <button
              type="button"
              aria-label={
                task.isMarked ? `Unmark ${task.title}` : `Mark ${task.title}`
              }
              onClick={(event) => {
                event.stopPropagation();
                onToggleMark(task);
              }}
              className={cn(
                "grid size-8 place-items-center rounded-xl transition hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/30 dark:hover:text-blue-400",
                task.isMarked
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-400",
              )}
            >
              <Star className={cn("size-4", task.isMarked && "fill-current")} />
            </button>
          ) : null}
          {onEdit ? (
            <button
              type="button"
              aria-label={`Edit ${task.title}`}
              onClick={(event) => {
                event.stopPropagation();
                onEdit(task);
              }}
              className="grid size-8 place-items-center rounded-xl text-gray-400 transition hover:bg-gray-50 hover:text-blue-600 dark:hover:bg-zinc-800 dark:hover:text-blue-400"
            >
              <Pencil className="size-4" />
            </button>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              aria-label={`Delete ${task.title}`}
              onClick={(event) => {
                event.stopPropagation();
                onDelete(task);
              }}
              className="grid size-8 place-items-center rounded-xl text-gray-400 transition hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/30 dark:hover:text-blue-400"
            >
              <Trash2 className="size-4" />
            </button>
          ) : null}
        </div>
      </div>

      <h3 className="mt-3 text-base font-bold leading-6 text-gray-950 dark:text-zinc-50">
        {task.title}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500 dark:text-zinc-400">
        {task.description || "No description has been added."}
      </p>

      {task.labels.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {task.labels.map((label) => {
            const labelMeta = labelsById[label];

            return (
              <span
                key={label}
                className="rounded-full px-2.5 py-1 text-xs font-bold text-white"
                style={{ backgroundColor: labelMeta?.color ?? "#dc2626" }}
              >
                {labelMeta?.name ?? label}
              </span>
            );
          })}
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-zinc-800">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-zinc-400">
          <CalendarDays className="size-4" />
          {task.dueDate
            ? new Date(task.dueDate).toLocaleDateString()
            : "No due date"}
        </span>

        <div className="flex -space-x-2">
          {assignees.slice(0, 3).map((assignee, index) => {
            const member = membersByUserId.get(getTaskMemberId(assignee));
            const label = member
              ? getMemberName(member)
              : getAssigneeLabel(assignee);

            return member ? (
              <span
                key={`${label}-${index}`}
                title={label}
                className="rounded-2xl border-2 border-white dark:border-zinc-900"
              >
                <MemberAvatar member={member} size="sm" />
              </span>
            ) : (
              <span
                key={`${label}-${index}`}
                title={label}
                className="grid size-8 place-items-center rounded-full border-2 border-white bg-gray-950 text-[11px] font-bold text-white dark:border-zinc-900 dark:bg-zinc-100 dark:text-zinc-950"
              >
                {getAssigneeInitials(assignee)}
              </span>
            );
          })}
        </div>
      </div>
    </article>
  );
}

export function getAssigneeLabel(assignee: TaskAssignee) {
  return typeof assignee === "string" ? assignee : assignee.name;
}

function getAssigneeInitials(assignee: TaskAssignee) {
  const label = getAssigneeLabel(assignee);
  return label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
