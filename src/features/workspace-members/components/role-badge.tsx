import { Badge } from "@/components/ui";
import type { WorkspaceRole } from "@/features/workspace-members/types";
import { roleLabel, roleTone } from "@/features/workspace-members/utils/role-utils";

export function RoleBadge({ role }: { role: WorkspaceRole }) {
  return <Badge tone={roleTone[role]}>{roleLabel[role]}</Badge>;
}
