import { createApi } from "@reduxjs/toolkit/query/react";
import {
  axiosBaseQuery,
  getApiErrorMessage
} from "@/services/axios-base-query";
import type { Workspace } from "@/modules/workspaces/types";
import type {
  ApiResponse,
  InvitationRole,
  InviteMemberRequest,
  UpdateMemberRoleRequest,
  WorkspaceData,
  WorkspaceInvitation,
  WorkspaceInvitationData,
  WorkspaceMember,
  WorkspaceMemberData,
  WorkspaceMembersData,
  WorkspaceSettingsRequest
} from "@/features/workspace-members/types";

function normalizeMember(data: WorkspaceMemberData): WorkspaceMember {
  const member = "member" in data ? data.member : data;
  const user =
    member.user && typeof member.user === "object"
      ? member.user
      : {
          id: String(member.user || ""),
          name: "Unknown user",
          email: ""
        };

  return {
    ...member,
    id: member.id ?? member._id ?? `${user.id}-${member.role}`,
    user: {
      ...user,
      id: user.id ?? user._id ?? ""
    }
  };
}

function normalizeMembers(data: WorkspaceMembersData): WorkspaceMember[] {
  const members = Array.isArray(data)
    ? data
    : data.members ?? data.workspaceMembers ?? data.items ?? [];

  return members.map(normalizeMember);
}

function normalizeInvitation(
  data: WorkspaceInvitationData
): WorkspaceInvitation {
  const invitation = "invitation" in data ? data.invitation : data;
  return {
    ...invitation,
    id: invitation.id ?? invitation._id ?? invitation.email
  };
}

function normalizeWorkspace(data: WorkspaceData): Workspace {
  const workspace = "workspace" in data ? data.workspace : data;
  return {
    ...workspace,
    id: workspace.id ?? workspace._id ?? workspace.slug,
    isDeleted: workspace.isDeleted ?? false
  };
}

export const workspaceMembersApi = createApi({
  reducerPath: "workspaceMembersApi",
  baseQuery: axiosBaseQuery,
  tagTypes: ["WorkspaceMembers", "Workspace"],
  endpoints: (builder) => ({
    getWorkspace: builder.query<Workspace, string>({
      query: (workspaceId) => ({
        url: `/workspaces/${workspaceId}`
      }),
      transformResponse: (response: ApiResponse<WorkspaceData>) =>
        normalizeWorkspace(response.data),
      providesTags: (_result, _error, workspaceId) => [
        { type: "Workspace", id: workspaceId }
      ]
    }),
    getWorkspaceMembers: builder.query<WorkspaceMember[], string>({
      query: (workspaceId) => ({
        url: `/workspaces/${workspaceId}/members`
      }),
      transformResponse: (response: ApiResponse<WorkspaceMembersData>) =>
        normalizeMembers(response.data),
      providesTags: (_result, _error, workspaceId) => [
        { type: "WorkspaceMembers", id: workspaceId }
      ]
    }),
    inviteWorkspaceMember: builder.mutation<
      WorkspaceInvitation,
      { workspaceId: string; data: InviteMemberRequest }
    >({
      query: ({ workspaceId, data }) => ({
        url: `/workspaces/${workspaceId}/invitations`,
        method: "POST",
        data
      }),
      transformResponse: (response: ApiResponse<WorkspaceInvitationData>) =>
        normalizeInvitation(response.data),
      invalidatesTags: (_result, _error, { workspaceId }) => [
        { type: "WorkspaceMembers", id: workspaceId }
      ]
    }),
    updateWorkspaceMemberRole: builder.mutation<
      WorkspaceMember,
      {
        workspaceId: string;
        memberId: string;
        data: UpdateMemberRoleRequest;
      }
    >({
      query: ({ workspaceId, memberId, data }) => ({
        url: `/workspaces/${workspaceId}/members/${memberId}/role`,
        method: "PATCH",
        data
      }),
      transformResponse: (response: ApiResponse<WorkspaceMemberData>) =>
        normalizeMember(response.data),
      invalidatesTags: (_result, _error, { workspaceId }) => [
        { type: "WorkspaceMembers", id: workspaceId }
      ]
    }),
    removeWorkspaceMember: builder.mutation<
      { memberId: string },
      { workspaceId: string; memberId: string }
    >({
      query: ({ workspaceId, memberId }) => ({
        url: `/workspaces/${workspaceId}/members/${memberId}`,
        method: "DELETE"
      }),
      transformResponse: (_response, _meta, arg) => ({ memberId: arg.memberId }),
      async onQueryStarted({ workspaceId, memberId }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          workspaceMembersApi.util.updateQueryData(
            "getWorkspaceMembers",
            workspaceId,
            (draft) => draft.filter((member) => member.id !== memberId)
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: (_result, _error, { workspaceId }) => [
        { type: "WorkspaceMembers", id: workspaceId }
      ]
    }),
    transferWorkspaceOwnership: builder.mutation<
      ApiResponse<Record<string, never>>,
      { workspaceId: string; memberId: string }
    >({
      query: ({ workspaceId, memberId }) => ({
        url: `/workspaces/${workspaceId}/transfer-ownership/${memberId}`,
        method: "POST"
      }),
      invalidatesTags: (_result, _error, { workspaceId }) => [
        { type: "WorkspaceMembers", id: workspaceId },
        { type: "Workspace", id: workspaceId }
      ]
    }),
    updateWorkspaceSettings: builder.mutation<
      Workspace,
      { workspaceId: string; data: WorkspaceSettingsRequest }
    >({
      query: ({ workspaceId, data }) => ({
        url: `/workspaces/${workspaceId}`,
        method: "PATCH",
        data
      }),
      transformResponse: (response: ApiResponse<WorkspaceData>) =>
        normalizeWorkspace(response.data),
      invalidatesTags: (_result, _error, { workspaceId }) => [
        { type: "Workspace", id: workspaceId }
      ]
    }),
    deleteWorkspace: builder.mutation<string, string>({
      query: (workspaceId) => ({
        url: `/workspaces/${workspaceId}`,
        method: "DELETE"
      }),
      transformResponse: (_response, _meta, workspaceId) => workspaceId,
      invalidatesTags: (_result, _error, workspaceId) => [
        { type: "Workspace", id: workspaceId }
      ]
    })
  })
});

export const {
  useDeleteWorkspaceMutation,
  useGetWorkspaceQuery,
  useGetWorkspaceMembersQuery,
  useInviteWorkspaceMemberMutation,
  useRemoveWorkspaceMemberMutation,
  useTransferWorkspaceOwnershipMutation,
  useUpdateWorkspaceMemberRoleMutation,
  useUpdateWorkspaceSettingsMutation
} = workspaceMembersApi;

export function getWorkspaceMemberApiError(
  error: unknown,
  fallback = "Workspace member request failed."
) {
  return getApiErrorMessage(error, fallback);
}

export type { InvitationRole };
