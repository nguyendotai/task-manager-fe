import api from "@/services/api";
import type {
  ApiResponse,
  CreateProjectRequest,
  Project,
  ProjectData,
  ProjectListData
} from "@/modules/projects/types";

function unwrapProject(data: ProjectData): Project {
  return "project" in data ? data.project : data;
}

function normalizeProject(data: ProjectData): Project {
  const project = unwrapProject(data);

  return {
    ...project,
    id: project.id ?? project._id ?? project.name,
    status: project.status ?? "ACTIVE"
  };
}

function normalizeProjectList(data: ProjectListData): Project[] {
  const projects = Array.isArray(data) ? data : data.projects;
  return projects.map(normalizeProject);
}

export const projectService = {
  async createProject(payload: CreateProjectRequest) {
    const response = await api.post<ApiResponse<ProjectData>>(
      "/projects",
      payload
    );
    return normalizeProject(response.data.data);
  },

  async getProjectsByWorkspace(workspaceId: string) {
    const response = await api.get<ApiResponse<ProjectListData>>(
      `/projects/workspace/${workspaceId}`
    );
    return normalizeProjectList(response.data.data);
  },

  async getProjectById(projectId: string) {
    const response = await api.get<ApiResponse<ProjectData>>(
      `/projects/${projectId}`
    );
    return normalizeProject(response.data.data);
  }
};
