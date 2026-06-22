import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { TaskListView } from "@/modules/tasks/components/task-list-view";

export default function MyTasksPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <TaskListView kind="my" />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
