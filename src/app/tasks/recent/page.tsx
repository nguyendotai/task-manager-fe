import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { TaskListView } from "@/modules/tasks/components/task-list-view";

export default function RecentTasksPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <TaskListView kind="recent" />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
