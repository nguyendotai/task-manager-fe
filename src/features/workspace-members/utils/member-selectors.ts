import type { User } from "@/types";
import type {
  WorkspaceMember,
  WorkspaceMemberUser
} from "@/features/workspace-members/types";

export function getUserId(user?: Partial<WorkspaceMemberUser | User> | null) {
  return user?.id ?? user?._id ?? "";
}

export function getMemberUser(member: WorkspaceMember) {
  return member.user;
}

export function getMemberName(member: WorkspaceMember) {
  return getMemberUser(member).name || "Unknown user";
}

export function getMemberEmail(member: WorkspaceMember) {
  return getMemberUser(member).email || "";
}

export function getMemberAvatar(member: WorkspaceMember) {
  return getMemberUser(member).avatar ?? null;
}

export function getMemberInitials(member: WorkspaceMember) {
  const user = getMemberUser(member);
  const source = user.name || user.email || "User";

  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function findCurrentWorkspaceMember(
  members: WorkspaceMember[],
  user: User | null
) {
  if (!user) {
    return null;
  }

  const currentUserId = getUserId(user);

  return (
    members.find((member) => {
      const memberUser = getMemberUser(member);
      return (
        getUserId(memberUser) === currentUserId ||
        Boolean(user.email && memberUser.email === user.email)
      );
    }) ?? null
  );
}

export function toMemberOptions(members: WorkspaceMember[]) {
  return members
    .map((member) => ({
      id: getUserId(member.user),
      label: getMemberName(member),
      email: getMemberEmail(member),
      role: member.role
    }))
    .filter((member) => Boolean(member.id));
}
