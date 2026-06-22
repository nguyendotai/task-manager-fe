import { redirect } from "next/navigation";

type BoardDetailPageProps = {
  params: Promise<{
    workspaceId: string;
    boardId: string;
  }>;
};

export default async function BoardDetailPage({ params }: BoardDetailPageProps) {
  const { workspaceId, boardId } = await params;

  redirect(`/workspaces/${workspaceId}/boards/${boardId}`);
}
