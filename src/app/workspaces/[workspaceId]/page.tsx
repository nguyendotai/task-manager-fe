import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { WorkspaceDetailView } from "@/modules/workspaces/components/workspace-detail-view";

type WorkspaceDetailPageProps = {
  params: Promise<{
    workspaceId: string;
  }>;
};

export default async function WorkspaceDetailPage({
  params
}: WorkspaceDetailPageProps) {
  const { workspaceId } = await params;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <WorkspaceDetailView workspaceId={workspaceId} />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
