"use client";

import { MemberPicker } from "@/features/workspace-members/components/member-picker";
import type { WorkspaceMember } from "@/features/workspace-members/types";

type AllowedMembersPickerProps = {
  members: WorkspaceMember[];
  value: string[];
  onChange: (value: string[]) => void;
  loading?: boolean;
  disabled?: boolean;
};

export function AllowedMembersPicker({
  members,
  value,
  onChange,
  loading,
  disabled
}: AllowedMembersPickerProps) {
  return (
    <MemberPicker
      members={members}
      value={value}
      onChange={onChange}
      loading={loading}
      disabled={disabled}
      placeholder="Search allowed members"
      emptyText="No workspace members found."
    />
  );
}
