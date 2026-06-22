"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button, ErrorState, Input, Skeleton, Textarea } from "@/components/ui";
import { useToast } from "@/components/providers/toast-provider";
import {
  getWorkspaceMemberApiError,
  useDeleteWorkspaceMutation,
  useGetWorkspaceQuery,
  useGetWorkspaceMembersQuery,
  useUpdateWorkspaceSettingsMutation,
} from "@/features/workspace-members/api/workspace-members-api";
import { useWorkspaceMemberPermissions } from "@/features/workspace-members/hooks/use-workspace-member-permissions";

type WorkspaceSettingsViewProps = {
  workspaceId: string;
};

type FormErrors = {
  name?: string;
  description?: string;
  logo?: string;
};

export function WorkspaceSettingsView({
  workspaceId,
}: WorkspaceSettingsViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const {
    data: selectedWorkspace,
    isLoading: loading,
    error,
    refetch: refetchWorkspace,
  } = useGetWorkspaceQuery(workspaceId);
  const { data: members = [] } = useGetWorkspaceMembersQuery(workspaceId);
  const permissions = useWorkspaceMemberPermissions(members);
  const [updateWorkspace, { isLoading: updating }] =
    useUpdateWorkspaceSettingsMutation();
  const [deleteWorkspace, { isLoading: deleting }] =
    useDeleteWorkspaceMutation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  useEffect(() => {
    if (!selectedWorkspace) {
      return;
    }

    setName(selectedWorkspace.name);
    setDescription(selectedWorkspace.description ?? "");
    setLogo(selectedWorkspace.logo ?? "");
  }, [selectedWorkspace]);

  function validate() {
    const nextErrors: FormErrors = {};

    if (name.trim().length < 2) {
      nextErrors.name = "Workspace name must be at least 2 characters.";
    }

    if (name.trim().length > 80) {
      nextErrors.name = "Workspace name must be 80 characters or less.";
    }

    if (description.trim().length > 500) {
      nextErrors.description = "Description must be 500 characters or less.";
    }

    if (logo.trim() && !/^https?:\/\/.+/.test(logo.trim())) {
      nextErrors.logo = "Logo must be a valid URL.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      await updateWorkspace({
        workspaceId,
        data: {
          name: name.trim(),
          description: description.trim(),
          logo: logo.trim() || null,
        },
      }).unwrap();
      toast({
        title: "Workspace updated",
        description: "Workspace settings were saved.",
        variant: "success",
      });
      refetchWorkspace();
    } catch (submitError) {
      toast({
        title: "Unable to update workspace",
        description: getWorkspaceMemberApiError(
          submitError,
          "You do not have permission to update this workspace.",
        ),
        variant: "error",
      });
    }
  }

  async function handleDelete() {
    if (!selectedWorkspace || deleteConfirmation !== selectedWorkspace.name) {
      return;
    }

    try {
      await deleteWorkspace(workspaceId).unwrap();
      toast({
        title: "Workspace deleted",
        description: `${selectedWorkspace.name} was deleted.`,
        variant: "success",
      });
      router.replace("/workspaces");
    } catch (deleteError) {
      toast({
        title: "Unable to delete workspace",
        description: getWorkspaceMemberApiError(
          deleteError,
          "Only workspace owners can delete this workspace.",
        ),
        variant: "error",
      });
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-40 rounded-full" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to load workspace"
        message={getWorkspaceMemberApiError(error)}
        onRetry={refetchWorkspace}
      />
    );
  }

  if (!selectedWorkspace) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/workspaces/${workspaceId}`}
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 transition hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-500"
      >
        <ArrowLeft className="size-4" />
        Back to workspace
      </Link>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-500">
          Settings
        </p>
        <h1 className="mt-2 text-3xl font-bold text-gray-950 dark:text-zinc-50">
          Workspace settings
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 dark:text-zinc-400">
          Update workspace profile details and owner-only danger zone actions.
        </p>
      </section>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <fieldset
          disabled={!permissions.canUpdateWorkspace || updating}
          className="space-y-4"
        >
          <label className="block">
            <span className="text-sm font-bold text-gray-700 dark:text-zinc-200">
              Name
            </span>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2"
            />
            {errors.name ? (
              <span className="mt-1 block text-xs font-semibold text-blue-600 dark:text-blue-400">
                {errors.name}
              </span>
            ) : null}
          </label>

          <label className="block">
            <span className="text-sm font-bold text-gray-700 dark:text-zinc-200">
              Description
            </span>
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              className="mt-2"
            />
            {errors.description ? (
              <span className="mt-1 block text-xs font-semibold text-blue-600 dark:text-blue-400">
                {errors.description}
              </span>
            ) : null}
          </label>

          <label className="block">
            <span className="text-sm font-bold text-gray-700 dark:text-zinc-200">
              Logo URL
            </span>
            <Input
              value={logo}
              onChange={(event) => setLogo(event.target.value)}
              className="mt-2"
              placeholder="https://example.com/logo.png"
            />
            {errors.logo ? (
              <span className="mt-1 block text-xs font-semibold text-blue-600 dark:text-blue-400">
                {errors.logo}
              </span>
            ) : null}
          </label>
        </fieldset>

        {!permissions.canUpdateWorkspace ? (
          <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-200">
            You do not have permission to update workspace settings.
          </p>
        ) : null}

        <div className="mt-5 flex justify-end">
          <Button
            type="submit"
            disabled={!permissions.canUpdateWorkspace || updating}
          >
            <Save className="size-4" />
            {updating ? "Saving..." : "Save settings"}
          </Button>
        </div>
      </form>

      <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm dark:border-blue-900/70 dark:bg-blue-950/25">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-blue-700 dark:text-blue-300">
              <AlertTriangle className="size-4" />
              Danger zone
            </p>
            <h2 className="mt-2 text-xl font-bold text-blue-950 dark:text-blue-100">
              Delete workspace
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-blue-800 dark:text-blue-200">
              This soft-deletes the workspace and removes it from normal lists.
              Only workspace owners can perform this action.
            </p>
          </div>
          <Button
            type="button"
            variant="danger"
            disabled={!permissions.canDeleteWorkspace}
            onClick={() => setDeleteConfirmOpen(true)}
          >
            <Trash2 className="size-4" />
            Delete workspace
          </Button>
        </div>
      </section>

      {deleteConfirmOpen ? (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-blue-200 bg-white p-5 shadow-soft dark:border-blue-900/70 dark:bg-zinc-950">
            <h2 className="text-2xl font-bold text-gray-950 dark:text-zinc-50">
              Delete {selectedWorkspace.name}
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-zinc-400">
              Type the workspace name to confirm deletion.
            </p>
            <Input
              value={deleteConfirmation}
              onChange={(event) => setDeleteConfirmation(event.target.value)}
              className="mt-5 font-bold"
              placeholder={selectedWorkspace.name}
            />
            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setDeleteConfirmation("");
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                disabled={
                  deleting || deleteConfirmation !== selectedWorkspace.name
                }
                onClick={handleDelete}
              >
                {deleting ? "Deleting..." : "Delete workspace"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
