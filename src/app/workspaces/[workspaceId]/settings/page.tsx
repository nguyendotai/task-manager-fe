import { ProtectedRoute } from "@/components/protected-route";
import { WorkspaceSettingsView } from "@/features/workspace-members/components/workspace-settings-view";
import { DashboardLayout } from "@/layouts/dashboard-layout";

type WorkspaceSettingsPageProps = {
  params: Promise<{
    workspaceId: string;
  }>;
};

export default async function WorkspaceSettingsPage({
  params
}: WorkspaceSettingsPageProps) {
  const { workspaceId } = await params;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <WorkspaceSettingsView workspaceId={workspaceId} />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
