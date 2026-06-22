import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { WorkspacesView } from "@/modules/workspaces/components/workspaces-view";

export default function WorkspacesPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <WorkspacesView />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
