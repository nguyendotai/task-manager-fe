"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Button, Input, Modal, Textarea } from "@/components/ui";
import { MemberPicker } from "@/features/workspace-members/components/member-picker";
import type {
  WorkspaceMember,
  WorkspaceRole,
} from "@/features/workspace-members/types";
import type { BoardColumn } from "@/modules/boards/types";
import type { Label } from "@/modules/labels/types";
import type {
  Task,
  TaskFormValues,
  TaskPriority,
  TaskStatus,
  TaskVisibility,
} from "@/modules/tasks/types";
import {
  canAssignTasks,
  canCreatePrivateTasks,
} from "@/modules/tasks/utils/task-permissions";
import {
  getTaskAllowedMemberIds,
  getTaskAssigneeIds,
} from "@/modules/tasks/utils/task-visibility";

const priorities: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const statuses: TaskStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];
const visibilities: TaskVisibility[] = ["PUBLIC", "PRIVATE"];

type TaskFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  columns: BoardColumn[];
  labelOptions: Label[];
  members: WorkspaceMember[];
  membersLoading?: boolean;
  actorRole?: WorkspaceRole | null;
  initialColumnId?: string;
  task?: Task | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => void;
};

type FormErrors = {
  title?: string;
  columnId?: string;
  assignees?: string;
  allowedMembers?: string;
};

export function TaskFormModal({
  open,
  mode,
  columns,
  labelOptions,
  members,
  membersLoading,
  actorRole,
  initialColumnId,
  task,
  loading,
  error,
  onClose,
  onSubmit,
}: TaskFormModalProps) {
  const defaultColumnId = initialColumnId ?? columns[0]?.id ?? "";
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [columnId, setColumnId] = useState(defaultColumnId);
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [status, setStatus] = useState<TaskStatus>("TODO");
  const [visibility, setVisibility] = useState<TaskVisibility>("PUBLIC");
  const [dueDate, setDueDate] = useState("");
  const [labels, setLabels] = useState("");
  const [assignees, setAssignees] = useState<string[]>([]);
  const [allowedMembers, setAllowedMembers] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const canAssign = canAssignTasks(actorRole);
  const canManagePrivate = canCreatePrivateTasks(actorRole);

  const titleText = mode === "create" ? "Create Task" : "Edit Task";

  const columnOptions = useMemo(
    () => columns.map((column) => ({ id: column.id, title: column.title })),
    [columns],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    setTitle(task?.title ?? "");
    setDescription(task?.description ?? "");
    setColumnId(task?.columnId ?? task?.column ?? defaultColumnId);
    setPriority(task?.priority ?? "MEDIUM");
    setStatus(task?.status ?? "TODO");
    setVisibility(task?.visibility ?? "PUBLIC");
    setDueDate(task?.dueDate ? task.dueDate.slice(0, 10) : "");
    setLabels(task?.labels.join(", ") ?? "");
    setAssignees(task ? getTaskAssigneeIds(task) : []);
    setAllowedMembers(task ? getTaskAllowedMemberIds(task) : []);
    setErrors({});
  }, [defaultColumnId, open, task]);

  if (!open) {
    return null;
  }

  function validate() {
    const nextErrors: FormErrors = {};

    if (title.trim().length < 2) {
      nextErrors.title = "Task title must be at least 2 characters.";
    }

    if (!columnId) {
      nextErrors.columnId = "Column is required.";
    }

    if (!canAssign && assignees.length > 0) {
      nextErrors.assignees = "You do not have permission to assign this task.";
    }

    if (visibility === "PRIVATE" && !canManagePrivate) {
      nextErrors.allowedMembers =
        "Only workspace owners/admins can create private tasks.";
    }

    if (visibility === "PRIVATE" && allowedMembers.length === 0) {
      nextErrors.allowedMembers =
        "Private tasks require at least one allowed member.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      columnId,
      assignees,
      allowedMembers: visibility === "PRIVATE" ? allowedMembers : [],
      labels: splitList(labels),
      priority,
      status,
      visibility,
      dueDate: dueDate || undefined,
    });
  }

  return (
    <Modal open={open} title={titleText} eyebrow="Task" onClose={onClose}>
      {error ? (
        <div className="mt-5 flex gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm font-bold text-gray-700 dark:text-zinc-200">
            Title
          </span>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-2"
            placeholder="Prepare release notes"
          />
          {errors.title ? (
            <span className="mt-1 block text-xs font-semibold text-blue-600 dark:text-blue-400">
              {errors.title}
            </span>
          ) : null}
        </label>

        <label className="block">
          <span className="text-sm font-bold text-gray-700 dark:text-zinc-200">
            Description
          </span>
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            className="mt-2"
            placeholder="Short task context"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-bold text-gray-700 dark:text-zinc-200">
              Column
            </span>
            <select
              value={columnId}
              onChange={(event) => setColumnId(event.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
            >
              {columnOptions.map((column) => (
                <option key={column.id} value={column.id}>
                  {column.title}
                </option>
              ))}
            </select>
            {errors.columnId ? (
              <span className="mt-1 block text-xs font-semibold text-blue-600 dark:text-blue-400">
                {errors.columnId}
              </span>
            ) : null}
          </label>

          <label className="block">
            <span className="text-sm font-bold text-gray-700 dark:text-zinc-200">
              Due date
            </span>
            <Input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="mt-2 font-bold"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-gray-700 dark:text-zinc-200">
              Priority
            </span>
            <select
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value as TaskPriority)
              }
              className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
            >
              {priorities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-bold text-gray-700 dark:text-zinc-200">
              Status
            </span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as TaskStatus)}
              className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
            >
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-bold text-gray-700 dark:text-zinc-200">
              Visibility
            </span>
            <select
              value={visibility}
              onChange={(event) =>
                setVisibility(event.target.value as TaskVisibility)
              }
              className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
            >
              {visibilities.map((item) => (
                <option
                  key={item}
                  value={item}
                  disabled={item === "PRIVATE" && !canManagePrivate}
                >
                  {item}
                </option>
              ))}
            </select>
            {!canManagePrivate ? (
              <p className="mt-2 flex gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
                <AlertCircle className="size-3.5" />
                Only workspace owners/admins can create private tasks.
              </p>
            ) : null}
          </label>
        </div>

        <div className="block">
          <span className="text-sm font-bold text-gray-700 dark:text-zinc-200">
            Labels
          </span>
          {labelOptions.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2 rounded-2xl border border-gray-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
              {labelOptions.map((label) => {
                const selectedLabels = splitList(labels);
                const checked =
                  selectedLabels.includes(label.id) ||
                  selectedLabels.includes(label.name);

                return (
                  <label
                    key={label.id}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold text-white"
                    style={{ backgroundColor: label.color }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        const nextLabels = checked
                          ? selectedLabels.filter(
                              (item) =>
                                item !== label.id && item !== label.name,
                            )
                          : [...selectedLabels, label.id];
                        setLabels(nextLabels.join(", "));
                      }}
                      className="size-3 rounded border-white/60 bg-white/20 text-blue-600"
                    />
                    {label.name}
                  </label>
                );
              })}
            </div>
          ) : (
            <Input
              value={labels}
              onChange={(event) => setLabels(event.target.value)}
              className="mt-2"
              placeholder="frontend, urgent, api"
            />
          )}
        </div>

        <div className="block">
          <span className="text-sm font-bold text-gray-700 dark:text-zinc-200">
            Assignees
          </span>
          <div className="mt-2">
            <MemberPicker
              members={members}
              value={assignees}
              onChange={setAssignees}
              loading={membersLoading}
              disabled={!canAssign}
              placeholder="Search assignees"
              emptyText="No workspace members available."
            />
          </div>
          {!canAssign ? (
            <p className="mt-2 text-xs font-semibold text-amber-700 dark:text-amber-300">
              You do not have permission to assign this task.
            </p>
          ) : null}
          {errors.assignees ? (
            <span className="mt-2 block text-xs font-semibold text-blue-600 dark:text-blue-400">
              {errors.assignees}
            </span>
          ) : null}
        </div>

        {visibility === "PRIVATE" ? (
          <div className="block">
            <span className="text-sm font-bold text-gray-700 dark:text-zinc-200">
              Allowed members
            </span>
            <div className="mt-2">
              <MemberPicker
                members={members}
                value={allowedMembers}
                onChange={setAllowedMembers}
                loading={membersLoading}
                disabled={!canManagePrivate}
                placeholder="Search allowed members"
                emptyText="No workspace members available."
              />
            </div>
            {errors.allowedMembers ? (
              <span className="mt-2 block text-xs font-semibold text-blue-600 dark:text-blue-400">
                {errors.allowedMembers}
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : titleText}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
