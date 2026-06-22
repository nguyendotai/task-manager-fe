import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { DashboardView } from "@/modules/dashboard/components/dashboard-view";

export default function HomePage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <DashboardView />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
