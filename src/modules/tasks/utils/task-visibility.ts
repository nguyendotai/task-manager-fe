import type { Task, TaskAssignee, TaskVisibility } from "@/modules/tasks/types";

export function getTaskVisibility(task: Task): TaskVisibility {
  return task.visibility ?? "PUBLIC";
}

export function isPrivateTask(task: Task) {
  return getTaskVisibility(task) === "PRIVATE";
}

export function getTaskMemberId(member: TaskAssignee | string) {
  if (typeof member === "string") {
    return member;
  }

  return member.id ?? member._id ?? "";
}

export function getTaskAssigneeIds(task: Task) {
  return task.assignees.map(getTaskMemberId).filter(Boolean);
}

export function getTaskAllowedMemberIds(task: Task) {
  return (task.allowedMembers ?? []).filter(Boolean);
}

export function getTaskAllowedMembersCount(task: Task) {
  return getTaskAllowedMemberIds(task).length;
}
