import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { BoardView } from "@/modules/boards/components/board-view";

type BoardPageProps = {
  params: Promise<{
    workspaceId: string;
    boardId: string;
  }>;
};

export default async function BoardPage({ params }: BoardPageProps) {
  const { workspaceId, boardId } = await params;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <BoardView workspaceId={workspaceId} boardId={boardId} />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
