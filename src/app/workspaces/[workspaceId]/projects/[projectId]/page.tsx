import { redirect } from "next/navigation";

type ProjectDetailPageProps = {
  params: Promise<{
    workspaceId: string;
    projectId: string;
  }>;
};

export default async function ProjectDetailPage({
  params
}: ProjectDetailPageProps) {
  const { workspaceId } = await params;

  redirect(`/workspaces/${workspaceId}`);
}
