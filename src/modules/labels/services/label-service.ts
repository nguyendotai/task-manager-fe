import api from "@/services/api";
import type {
  ApiResponse,
  CreateLabelRequest,
  Label,
  LabelData,
  LabelListData,
  UpdateLabelRequest
} from "@/modules/labels/types";

function unwrapLabel(data: LabelData): Label {
  return "label" in data ? data.label : data;
}

function normalizeLabel(data: LabelData): Label {
  const label = unwrapLabel(data);

  return {
    ...label,
    id: label.id ?? label._id ?? label.name,
    color: label.color ?? "#000000"
  };
}

function normalizeLabelList(data: LabelListData): Label[] {
  const labels = Array.isArray(data) ? data : data.labels;
  return labels.map(normalizeLabel);
}

export const labelService = {
  async createLabel(payload: CreateLabelRequest) {
    const response = await api.post<ApiResponse<LabelData>>("/labels", {
      name: payload.name,
      color: payload.color,
      workspace: payload.workspace,
      workspaceId: payload.workspaceId ?? payload.workspace
    });
    return normalizeLabel(response.data.data);
  },

  async getLabelsByWorkspace(workspaceId: string) {
    const response = await api.get<ApiResponse<LabelListData>>(
      `/labels/workspace/${workspaceId}`
    );
    return normalizeLabelList(response.data.data);
  },

  async updateLabel(labelId: string, payload: UpdateLabelRequest) {
    const response = await api.patch<ApiResponse<LabelData>>(
      `/labels/${labelId}`,
      payload
    );
    return normalizeLabel(response.data.data);
  },

  async deleteLabel(labelId: string) {
    await api.delete<ApiResponse<Record<string, never>>>(`/labels/${labelId}`);
    return labelId;
  }
};
