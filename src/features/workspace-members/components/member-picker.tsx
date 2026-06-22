"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Loader2, Search, X } from "lucide-react";
import { Input } from "@/components/ui";
import { MemberAvatar } from "@/features/workspace-members/components/member-avatar";
import { RoleBadge } from "@/features/workspace-members/components/role-badge";
import { useDebouncedValue } from "@/features/workspace-members/hooks/use-debounced-value";
import type { WorkspaceMember } from "@/features/workspace-members/types";
import {
  getMemberEmail,
  getMemberName,
  getUserId,
} from "@/features/workspace-members/utils/member-selectors";
import { cn } from "@/lib/utils";

type MemberPickerProps = {
  members: WorkspaceMember[];
  value: string[];
  onChange: (value: string[]) => void;
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  emptyText?: string;
  maxVisible?: number;
};

export function MemberPicker({
  members,
  value,
  onChange,
  loading,
  disabled,
  placeholder = "Search members",
  emptyText = "No members found.",
  maxVisible = 80,
}: MemberPickerProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const debouncedQuery = useDebouncedValue(query);
  const selectedSet = useMemo(() => new Set(value), [value]);
  const listRef = useRef<HTMLDivElement>(null);

  const normalizedMembers = useMemo(
    () => members.filter((member) => Boolean(getUserId(member.user))),
    [members],
  );

  const selectedMembers = useMemo(
    () =>
      normalizedMembers.filter((member) =>
        selectedSet.has(getUserId(member.user)),
      ),
    [normalizedMembers, selectedSet],
  );

  const filteredMembers = useMemo(() => {
    const normalizedQuery = debouncedQuery.trim().toLowerCase();
    const filtered = normalizedMembers.filter((member) => {
      const name = getMemberName(member).toLowerCase();
      const email = getMemberEmail(member).toLowerCase();
      const role = member.role.toLowerCase();

      return (
        normalizedQuery.length === 0 ||
        name.includes(normalizedQuery) ||
        email.includes(normalizedQuery) ||
        role.includes(normalizedQuery)
      );
    });

    return filtered.slice(0, maxVisible);
  }, [debouncedQuery, maxVisible, normalizedMembers]);

  useEffect(() => {
    setActiveIndex(0);
  }, [debouncedQuery]);

  function toggleMember(userId: string) {
    if (disabled) {
      return;
    }

    onChange(
      selectedSet.has(userId)
        ? value.filter((item) => item !== userId)
        : [...value, userId],
    );
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) =>
        Math.min(index + 1, Math.max(filteredMembers.length - 1, 0)),
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    }

    if (event.key === "Enter" && filteredMembers[activeIndex]) {
      event.preventDefault();
      toggleMember(getUserId(filteredMembers[activeIndex].user));
    }
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950",
        disabled && "opacity-70",
      )}
    >
      {selectedMembers.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {selectedMembers.map((member) => {
            const userId = getUserId(member.user);

            return (
              <span
                key={userId}
                className="inline-flex max-w-full items-center gap-2 rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-100 dark:bg-blue-950/30 dark:text-blue-200 dark:ring-blue-900/60"
              >
                <MemberAvatar member={member} size="sm" />
                <span className="max-w-32 truncate">
                  {getMemberName(member)}
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${getMemberName(member)}`}
                  disabled={disabled}
                  onClick={() => toggleMember(userId)}
                  className="grid size-5 place-items-center rounded-full hover:bg-blue-100 disabled:cursor-not-allowed dark:hover:bg-blue-900/60"
                >
                  <X className="size-3" />
                </button>
              </span>
            );
          })}
        </div>
      ) : null}

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="h-10 rounded-xl pl-10 pr-10"
          placeholder={placeholder}
          aria-label={placeholder}
        />
        {loading ? (
          <Loader2 className="absolute right-4 top-1/2 size-4 -translate-y-1/2 animate-spin text-gray-400" />
        ) : null}
      </div>

      <div
        ref={listRef}
        className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1"
      >
        {!loading && filteredMembers.length === 0 ? (
          <p className="rounded-2xl bg-gray-50 px-3 py-4 text-center text-sm font-semibold text-gray-400 dark:bg-zinc-900 dark:text-zinc-500">
            {emptyText}
          </p>
        ) : null}

        {filteredMembers.map((member, index) => {
          const userId = getUserId(member.user);
          const checked = selectedSet.has(userId);

          return (
            <button
              key={member.id}
              type="button"
              disabled={disabled}
              onClick={() => toggleMember(userId)}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left transition disabled:cursor-not-allowed",
                index === activeIndex
                  ? "bg-blue-50 dark:bg-blue-950/30"
                  : "bg-gray-50 hover:bg-blue-50 dark:bg-zinc-900 dark:hover:bg-blue-950/30",
              )}
            >
              <span
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-md border text-white",
                  checked
                    ? "border-blue-600 bg-blue-600"
                    : "border-gray-300 bg-white text-transparent dark:border-zinc-700 dark:bg-zinc-950",
                )}
              >
                <Check className="size-3.5" />
              </span>
              <MemberAvatar member={member} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-gray-800 dark:text-zinc-100">
                  {getMemberName(member)}
                </span>
                <span className="block truncate text-xs font-semibold text-gray-500 dark:text-zinc-400">
                  {getMemberEmail(member) || "No email"}
                </span>
              </span>
              <RoleBadge role={member.role} />
            </button>
          );
        })}
      </div>

      {normalizedMembers.length > maxVisible ? (
        <p className="mt-2 text-xs font-semibold text-gray-400 dark:text-zinc-500">
          Showing {Math.min(filteredMembers.length, maxVisible)} members. Search
          to narrow the list.
        </p>
      ) : null}
    </div>
  );
}
