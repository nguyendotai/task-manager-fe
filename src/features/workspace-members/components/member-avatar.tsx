import type { WorkspaceMember } from "@/features/workspace-members/types";
import {
  getMemberAvatar,
  getMemberInitials,
  getMemberName,
} from "@/features/workspace-members/utils/member-selectors";

export function MemberAvatar({
  member,
  size = "md",
}: {
  member: WorkspaceMember;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClassName = {
    sm: "size-9 text-xs",
    md: "size-11 text-sm",
    lg: "size-14 text-base",
  }[size];
  const avatar = getMemberAvatar(member);

  return (
    <span
      className={`${sizeClassName} grid shrink-0 place-items-center overflow-hidden rounded-2xl bg-blue-50 font-black text-blue-600 dark:bg-blue-950/40 dark:text-blue-300`}
    >
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatar}
          alt=""
          className="size-full object-cover"
          aria-hidden="true"
        />
      ) : (
        <span aria-label={getMemberName(member)}>
          {getMemberInitials(member)}
        </span>
      )}
    </span>
  );
}
