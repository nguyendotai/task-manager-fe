import { ProtectedRoute } from "@/components/protected-route";
import { WorkspaceMembersView } from "@/features/workspace-members/components/workspace-members-view";
import { DashboardLayout } from "@/layouts/dashboard-layout";

type WorkspaceMembersPageProps = {
  params: Promise<{
    workspaceId: string;
  }>;
};

export default async function WorkspaceMembersPage({
  params
}: WorkspaceMembersPageProps) {
  const { workspaceId } = await params;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <WorkspaceMembersView workspaceId={workspaceId} />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
