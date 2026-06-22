export type LabelWorkspace = string | { id?: string; _id?: string; name?: string };

export type Label = {
  id: string;
  _id?: string;
  name: string;
  color: string;
  workspace: LabelWorkspace;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateLabelRequest = {
  name: string;
  color: string;
  workspace: string;
  workspaceId?: string;
};

export type UpdateLabelRequest = Partial<Pick<CreateLabelRequest, "name" | "color">>;

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type LabelListData =
  | Label[]
  | {
      labels: Label[];
    };

export type LabelData =
  | Label
  | {
      label: Label;
    };
