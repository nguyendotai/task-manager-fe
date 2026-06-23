import api from "@/services/api";
import type {
  ApiResponse,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  Workspace,
  WorkspaceListData,
  WorkspaceMember,
} from "@/modules/workspaces/types";

type WorkspaceListItem =
  | Workspace
  | {
      workspace?: Workspace | null;
    }
  | null
  | undefined;

function unwrapWorkspace(item: WorkspaceListItem): Workspace | null {
  if (!item) {
    return null;
  }

  if ("workspace" in item) {
    return item.workspace ?? null;
  }

  return "name" in item && "slug" in item ? item : null;
}

function normalizeWorkspace(item: WorkspaceListItem): Workspace | null {
  const workspace = unwrapWorkspace(item);

  if (!workspace) {
    return null;
  }

  return {
    ...workspace,
    id: workspace.id ?? workspace._id ?? workspace.slug,
    isDeleted: workspace.isDeleted ?? false,
  };
}

function normalizeWorkspaceList(data: WorkspaceListData): Workspace[] {
  const workspaces = Array.isArray(data) ? data : data.workspaces;
  return workspaces
    .map(normalizeWorkspace)
    .filter((workspace): workspace is Workspace => Boolean(workspace?.id));
}

export const workspaceService = {
  async getWorkspaces() {
    const response =
      await api.get<ApiResponse<WorkspaceListData>>("/workspaces");
    return normalizeWorkspaceList(response.data.data);
  },

  async createWorkspace(payload: CreateWorkspaceRequest) {
    const response = await api.post<ApiResponse<Workspace>>(
      "/workspaces",
      payload,
    );
    const workspace = normalizeWorkspace(response.data.data);

    if (!workspace) {
      throw new Error("Workspace response did not include a workspace.");
    }

    return workspace;
  },

  async getWorkspaceById(workspaceId: string) {
    const response = await api.get<ApiResponse<Workspace>>(
      `/workspaces/${workspaceId}`,
    );
    const workspace = normalizeWorkspace(response.data.data);

    if (!workspace) {
      throw new Error("Workspace response did not include a workspace.");
    }

    return workspace;
  },

  async updateWorkspace(workspaceId: string, payload: UpdateWorkspaceRequest) {
    const response = await api.patch<ApiResponse<Workspace>>(
      `/workspaces/${workspaceId}`,
      payload,
    );
    const workspace = normalizeWorkspace(response.data.data);

    if (!workspace) {
      throw new Error("Workspace response did not include a workspace.");
    }

    return workspace;
  },

  async deleteWorkspace(workspaceId: string) {
    await api.delete<ApiResponse<Record<string, never>>>(
      `/workspaces/${workspaceId}`,
    );
    return workspaceId;
  },

  async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    const response = await api.get<ApiResponse<any[]>>(
      `/workspaces/${workspaceId}/members`,
    );

    return response.data.data.map((member) => ({
      id: member._id,
      role: member.role,
      joinedAt: member.joinedAt,
      user: member.user,
    }));
  },
};
