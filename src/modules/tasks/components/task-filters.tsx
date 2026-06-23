"use client";

import { useState } from "react";
import { Check, Filter, RotateCcw } from "lucide-react";
import { MemberAvatar } from "@/features/workspace-members/components/member-avatar";
import { RoleBadge } from "@/features/workspace-members/components/role-badge";
import type { WorkspaceMember } from "@/features/workspace-members/types";
import {
  getMemberEmail,
  getMemberName,
  getUserId,
} from "@/features/workspace-members/utils/member-selectors";
import { cn } from "@/lib/utils";
import type {
  TaskPriority,
  TaskStatus,
  TaskVisibility,
} from "@/modules/tasks/types";

export type TaskFiltersState = {
  priorities: TaskPriority[];
  statuses: TaskStatus[];
  labels: string[];
  assignees: string[];
  visibilities: TaskVisibility[];
};

type TaskFiltersProps = {
  filters: TaskFiltersState;
  labelOptions: string[];
  members: WorkspaceMember[];
  onChange: (filters: TaskFiltersState) => void;
};

type FilterKey =
  | "priorities"
  | "statuses"
  | "labels"
  | "assignees"
  | "visibilities";

const priorityOptions: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const statusOptions: TaskStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];
const visibilityOptions: TaskVisibility[] = ["PUBLIC", "PRIVATE"];

const emptyFilters: TaskFiltersState = {
  priorities: [],
  statuses: [],
  labels: [],
  assignees: [],
  visibilities: [],
};

const filterMenu: Array<{
  key: FilterKey;
  title: string;
  description: string;
}> = [
  {
    key: "priorities",
    title: "Priority",
    description: "Low, medium, high, urgent",
  },
  {
    key: "statuses",
    title: "Status",
    description: "Workflow status",
  },
  {
    key: "visibilities",
    title: "Visibility",
    description: "Public or private",
  },
  {
    key: "labels",
    title: "Labels",
    description: "Workspace labels",
  },
  {
    key: "assignees",
    title: "Assignee",
    description: "Workspace members",
  },
];

export function TaskFilters({
  filters,
  labelOptions,
  members,
  onChange,
}: TaskFiltersProps) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("priorities");
  const activeCount =
    filters.priorities.length +
    filters.statuses.length +
    filters.labels.length +
    filters.assignees.length +
    filters.visibilities.length;

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-4 border-b border-gray-100 p-4 dark:border-zinc-800 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-500">
            <Filter className="size-4" />
            Filter Panel
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
            Filter tasks by workflow, people, labels, and visibility.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onChange(emptyFilters)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-700 transition hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <RotateCcw className="size-4" />
          Reset {activeCount > 0 ? `(${activeCount})` : ""}
        </button>
      </div>

      <div className="grid min-h-72 md:grid-cols-[260px_minmax(0,1fr)]">
        <div className="border-b border-gray-100 bg-gray-50 p-3 dark:border-zinc-800 dark:bg-zinc-950 md:border-b-0 md:border-r">
          <div className="space-y-1">
            {filterMenu.map((item) => {
              const selectedCount = filters[item.key].length;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveFilter(item.key)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-3 text-left transition",
                    activeFilter === item.key
                      ? "bg-blue-600 text-white shadow-lg -600/20 dark:bg-blue-500"
                      : "text-gray-600 hover:bg-white hover:text-gray-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50",
                  )}
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-bold">
                      {item.title}
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 block truncate text-xs",
                        activeFilter === item.key
                          ? "text-blue-50 dark:text-blue-100"
                          : "text-gray-400 dark:text-zinc-500",
                      )}
                    >
                      {item.description}
                    </span>
                  </span>
                  {selectedCount > 0 ? (
                    <span
                      className={cn(
                        "grid size-6 shrink-0 place-items-center rounded-full text-xs font-black",
                        activeFilter === item.key
                          ? "bg-white text-blue-600"
                          : "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
                      )}
                    >
                      {selectedCount}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4">
          {activeFilter === "assignees" ? (
            <MemberFilter
              members={members}
              selected={filters.assignees}
              onToggle={(value) =>
                onChange({
                  ...filters,
                  assignees: toggle(filters.assignees, value),
                })
              }
            />
          ) : (
            <OptionFilter
              title={getFilterTitle(activeFilter)}
              options={getOptions(activeFilter, labelOptions)}
              selected={filters[activeFilter] as string[]}
              onToggle={(value) =>
                onChange({
                  ...filters,
                  [activeFilter]: toggle(
                    filters[activeFilter] as string[],
                    value,
                  ),
                })
              }
            />
          )}
        </div>
      </div>
    </section>
  );
}

function OptionFilter({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <>
      <FilterHeader title={title} selectedCount={selected.length} />
      <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {options.length === 0 ? <EmptyFilterState /> : null}
        {options.map((option) => {
          const checked = selected.includes(option);

          return (
            <FilterButton
              key={option}
              checked={checked}
              onClick={() => onToggle(option)}
            >
              <span className="min-w-0 truncate">{option}</span>
            </FilterButton>
          );
        })}
      </div>
    </>
  );
}

function MemberFilter({
  members,
  selected,
  onToggle,
}: {
  members: WorkspaceMember[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <>
      <FilterHeader title="Assignee" selectedCount={selected.length} />
      <div className="mt-5 grid max-h-80 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
        {members.length === 0 ? <EmptyFilterState /> : null}
        {members.map((member) => {
          const userId = getUserId(member.user);
          const checked = selected.includes(userId);

          return (
            <FilterButton
              key={member.id}
              checked={checked}
              onClick={() => onToggle(userId)}
            >
              <MemberAvatar member={member} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block truncate">{getMemberName(member)}</span>
                <span className="block truncate text-xs font-semibold text-gray-400 dark:text-zinc-500">
                  {getMemberEmail(member) || "No email"}
                </span>
              </span>
              <RoleBadge role={member.role} />
            </FilterButton>
          );
        })}
      </div>
    </>
  );
}

function FilterHeader({
  title,
  selectedCount,
}: {
  title: string;
  selectedCount: number;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="text-lg font-bold text-gray-950 dark:text-zinc-50">
          {title}
        </h3>
        <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-zinc-400">
          Select one or more options.
        </p>
      </div>
      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-100 dark:bg-blue-950/30 dark:text-blue-300 dark:ring-blue-900/60">
        {selectedCount} selected
      </span>
    </div>
  );
}

function FilterButton({
  checked,
  children,
  onClick,
}: {
  checked: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-12 items-center justify-between gap-3 rounded-2xl border px-3 py-3 text-left text-sm font-bold transition",
        checked
          ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/70 dark:bg-blue-950/30 dark:text-blue-300"
          : "border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:bg-blue-50/60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-blue-900/70 dark:hover:bg-blue-950/20",
      )}
    >
      {children}
      <span
        className={cn(
          "grid size-6 shrink-0 place-items-center rounded-full border transition",
          checked
            ? "border-blue-600 bg-blue-600 text-white"
            : "border-gray-300 text-transparent dark:border-zinc-700",
        )}
      >
        <Check className="size-3.5" />
      </span>
    </button>
  );
}

function EmptyFilterState() {
  return (
    <div className="col-span-full rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm font-semibold text-gray-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-500">
      No options available
    </div>
  );
}

function getFilterTitle(key: FilterKey) {
  const titles: Record<FilterKey, string> = {
    priorities: "Priority",
    statuses: "Status",
    labels: "Labels",
    assignees: "Assignee",
    visibilities: "Visibility",
  };

  return titles[key];
}

function getOptions(key: FilterKey, labelOptions: string[]) {
  if (key === "priorities") {
    return priorityOptions;
  }

  if (key === "statuses") {
    return statusOptions;
  }

  if (key === "visibilities") {
    return visibilityOptions;
  }

  return labelOptions;
}

function toggle<T extends string>(items: T[], item: T) {
  return items.includes(item)
    ? items.filter((current) => current !== item)
    : [...items, item];
}
