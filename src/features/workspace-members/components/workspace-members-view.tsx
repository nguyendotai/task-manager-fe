"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Crown,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Trash2,
  UserCog,
  UsersRound,
} from "lucide-react";
import { Button, EmptyState, ErrorState, Input } from "@/components/ui";
import {
  getWorkspaceMemberApiError,
  useGetWorkspaceMembersQuery,
} from "@/features/workspace-members/api/workspace-members-api";
import { InviteMemberModal } from "@/features/workspace-members/components/invite-member-modal";
import { ManageMemberRoleModal } from "@/features/workspace-members/components/manage-member-role-modal";
import { MemberAvatar } from "@/features/workspace-members/components/member-avatar";
import { RemoveMemberConfirm } from "@/features/workspace-members/components/remove-member-confirm";
import { RoleBadge } from "@/features/workspace-members/components/role-badge";
import { TransferOwnershipModal } from "@/features/workspace-members/components/transfer-ownership-modal";
import { WorkspaceMembersSkeleton } from "@/features/workspace-members/components/workspace-members-skeleton";
import { useWorkspaceMemberPermissions } from "@/features/workspace-members/hooks/use-workspace-member-permissions";
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
  canEditMemberRole,
  canRemoveMember,
  canTransferOwnership,
} from "@/features/workspace-members/utils/permission-helpers";
import {
  roleLabel,
  workspaceRoles,
} from "@/features/workspace-members/utils/role-utils";
import { cn } from "@/lib/utils";

type WorkspaceMembersViewProps = {
  workspaceId: string;
};

export function WorkspaceMembersView({
  workspaceId,
}: WorkspaceMembersViewProps) {
  const {
    data: members = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetWorkspaceMembersQuery(workspaceId);
  const permissions = useWorkspaceMemberPermissions(members);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<WorkspaceRole | "ALL">("ALL");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [roleTarget, setRoleTarget] = useState<WorkspaceMember | null>(null);
  const [removeTarget, setRemoveTarget] = useState<WorkspaceMember | null>(
    null,
  );
  const [transferTarget, setTransferTarget] = useState<WorkspaceMember | null>(
    null,
  );
  const [openActionsId, setOpenActionsId] = useState<string | null>(null);

  const filteredMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return members.filter((member) => {
      const matchesRole = roleFilter === "ALL" || member.role === roleFilter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        getMemberName(member).toLowerCase().includes(normalizedQuery) ||
        getMemberEmail(member).toLowerCase().includes(normalizedQuery);

      return matchesRole && matchesQuery;
    });
  }, [members, query, roleFilter]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Header
          workspaceId={workspaceId}
          canInvite={false}
          onInvite={() => null}
        />
        <WorkspaceMembersSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Header
          workspaceId={workspaceId}
          canInvite={false}
          onInvite={() => null}
        />
        <ErrorState
          title="Unable to load workspace members"
          message={getWorkspaceMemberApiError(error)}
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header
        workspaceId={workspaceId}
        canInvite={permissions.canInvite}
        onInvite={() => setInviteOpen(true)}
      />

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="pl-12"
              placeholder="Search by name or email"
              aria-label="Search members"
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(event.target.value as WorkspaceRole | "ALL")
              }
              className="h-12 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
              aria-label="Filter by role"
            >
              <option value="ALL">All roles</option>
              {workspaceRoles.map((role) => (
                <option key={role} value={role}>
                  {roleLabel[role]}
                </option>
              ))}
            </select>
            <Button variant="secondary" onClick={refetch} disabled={isFetching}>
              <RefreshCw
                className={cn("size-4", isFetching && "animate-spin")}
              />
              Refresh
            </Button>
          </div>
        </div>
      </section>

      {members.length === 0 ? (
        <EmptyState
          icon={<UsersRound className="size-7" />}
          title="No members yet"
          description="Invite the first workspace member to collaborate on projects, boards, and tasks."
        />
      ) : null}

      {members.length > 0 && filteredMembers.length === 0 ? (
        <EmptyState
          icon={<Search className="size-7" />}
          title="No matching members"
          description="Adjust search or role filters to find members."
        />
      ) : null}

      {filteredMembers.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="hidden grid-cols-[minmax(0,1.5fr)_160px_160px_80px] border-b border-gray-100 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-gray-400 dark:border-zinc-800 lg:grid">
            <span>Member</span>
            <span>Role</span>
            <span>Joined</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-zinc-800">
            {filteredMembers.map((member) => {
              const isSelf =
                getUserId(member.user) === permissions.currentUserId;
              const canManageRole = canEditMemberRole(
                permissions.currentMember,
                member,
                permissions.currentUserId,
              );
              const canRemove =
                !isSelf &&
                member.role !== "WORKSPACE_OWNER" &&
                canRemoveMember(permissions.role) &&
                canManageRole;
              const canTransfer =
                !isSelf &&
                member.role !== "WORKSPACE_OWNER" &&
                canTransferOwnership(permissions.role);

              return (
                <article
                  key={member.id}
                  className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1.5fr)_160px_160px_80px] lg:items-center"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <MemberAvatar member={member} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-bold text-gray-950 dark:text-zinc-50">
                          {getMemberName(member)}
                        </p>
                        {isSelf ? (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-500 dark:bg-zinc-800 dark:text-zinc-300">
                            You
                          </span>
                        ) : null}
                      </div>
                      <p className="truncate text-xs font-semibold text-gray-500 dark:text-zinc-400">
                        {getMemberEmail(member)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <RoleBadge role={member.role} />
                  </div>

                  <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400">
                    {member.joinedAt
                      ? new Date(member.joinedAt).toLocaleDateString()
                      : member.createdAt
                        ? new Date(member.createdAt).toLocaleDateString()
                        : "Not available"}
                  </p>

                  <div className="relative flex justify-end">
                    <button
                      type="button"
                      aria-haspopup="menu"
                      aria-expanded={openActionsId === member.id}
                      aria-label={`Open actions for ${getMemberName(member)}`}
                      onClick={() =>
                        setOpenActionsId((current) =>
                          current === member.id ? null : member.id,
                        )
                      }
                      className="grid size-10 place-items-center rounded-2xl border border-gray-200 text-gray-500 transition hover:bg-gray-50 hover:text-gray-950 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                    >
                      <MoreHorizontal className="size-5" />
                    </button>

                    {openActionsId === member.id ? (
                      <div
                        role="menu"
                        className="absolute right-0 top-11 z-20 w-56 overflow-hidden rounded-2xl border border-gray-200 bg-white p-1 shadow-soft dark:border-zinc-800 dark:bg-zinc-950"
                      >
                        <ActionItem
                          icon={<UserCog className="size-4" />}
                          disabled={!canManageRole}
                          onClick={() => {
                            setRoleTarget(member);
                            setOpenActionsId(null);
                          }}
                        >
                          Manage role
                        </ActionItem>
                        <ActionItem
                          icon={<Crown className="size-4" />}
                          disabled={!canTransfer}
                          onClick={() => {
                            setTransferTarget(member);
                            setOpenActionsId(null);
                          }}
                        >
                          Transfer ownership
                        </ActionItem>
                        <ActionItem
                          icon={<Trash2 className="size-4" />}
                          disabled={!canRemove}
                          danger
                          onClick={() => {
                            setRemoveTarget(member);
                            setOpenActionsId(null);
                          }}
                        >
                          Remove member
                        </ActionItem>
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      ) : null}

      <InviteMemberModal
        open={inviteOpen}
        workspaceId={workspaceId}
        actorRole={permissions.role}
        onClose={() => setInviteOpen(false)}
      />
      <ManageMemberRoleModal
        open={roleTarget !== null}
        workspaceId={workspaceId}
        actorRole={permissions.role}
        member={roleTarget}
        onClose={() => setRoleTarget(null)}
      />
      <RemoveMemberConfirm
        open={removeTarget !== null}
        workspaceId={workspaceId}
        member={removeTarget}
        onClose={() => setRemoveTarget(null)}
      />
      <TransferOwnershipModal
        open={transferTarget !== null}
        workspaceId={workspaceId}
        member={transferTarget}
        onClose={() => setTransferTarget(null)}
      />
    </div>
  );
}

function Header({
  workspaceId,
  canInvite,
  onInvite,
}: {
  workspaceId: string;
  canInvite: boolean;
  onInvite: () => void;
}) {
  return (
    <>
      <Link
        href={`/workspaces/${workspaceId}`}
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 transition hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-500"
      >
        <ArrowLeft className="size-4" />
        Back to workspace
      </Link>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-500">
              <UsersRound className="size-4" />
              Members
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-normal text-gray-950 dark:text-zinc-50">
              Workspace members
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 dark:text-zinc-400">
              Manage invitations, roles, ownership, and workspace access.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/workspaces/${workspaceId}/settings`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-700 transition hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <Settings className="size-4" />
              Settings
            </Link>
            <Button onClick={onInvite} disabled={!canInvite}>
              <Plus className="size-5" />
              Invite member
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

function ActionItem({
  children,
  icon,
  disabled,
  danger,
  onClick,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-45",
        danger
          ? "text-blue-600 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950/30"
          : "text-gray-700 hover:bg-gray-50 dark:text-zinc-200 dark:hover:bg-zinc-900",
      )}
    >
      {icon}
      {children}
    </button>
  );
}
