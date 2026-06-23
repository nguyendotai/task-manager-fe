"use client";

import { FormEvent, useEffect, useState } from "react";
import { AlertCircle, X } from "lucide-react";
import {
  clearProjectErrors,
  createProject,
} from "@/modules/projects/store/project-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

type CreateProjectModalProps = {
  open: boolean;
  workspaceId: string;
  onClose: () => void;
};

type FormErrors = {
  name?: string;
  description?: string;
};

export function CreateProjectModal({
  open,
  workspaceId,
  onClose,
}: CreateProjectModalProps) {
  const dispatch = useAppDispatch();
  const { creating, createError } = useAppSelector((state) => state.projects);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (open) {
      dispatch(clearProjectErrors());
      return;
    }

    setName("");
    setDescription("");
    setErrors({});
  }, [dispatch, open]);

  if (!open) {
    return null;
  }

  function validate() {
    const nextErrors: FormErrors = {};

    if (name.trim().length < 2) {
      nextErrors.name = "Project name must be at least 2 characters.";
    }

    if (description.trim().length > 280) {
      nextErrors.description = "Description must be 280 characters or less.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const result = await dispatch(
      createProject({
        name: name.trim(),
        description: description.trim(),
        workspaceId,
      }),
    );

    if (createProject.fulfilled.match(result)) {
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/45 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-5 shadow-soft dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-500">
              New project
            </p>
            <h2 className="mt-2 text-2xl font-bold text-gray-950 dark:text-zinc-50">
              Create Project
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-zinc-400">
              Add a project to this workspace. Permissions are enforced by the
              backend.
            </p>
          </div>

          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="grid size-10 place-items-center rounded-2xl border border-gray-200 text-gray-500 transition hover:bg-gray-50 hover:text-gray-950 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          >
            <X className="size-5" />
          </button>
        </div>

        {createError ? (
          <div className="mt-5 flex gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{createError}</span>
          </div>
        ) : null}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-bold text-gray-700 dark:text-zinc-200">
              Name
            </span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-blue-500 dark:focus:ring-blue-500/10"
              placeholder="Mobile app launch"
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
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              className="mt-2 w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm leading-6 text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-blue-500 dark:focus:ring-blue-500/10"
              placeholder="What should this project deliver?"
            />
            {errors.description ? (
              <span className="mt-1 block text-xs font-semibold text-blue-600 dark:text-blue-400">
                {errors.description}
              </span>
            ) : null}
          </label>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-2xl border border-gray-200 bg-white px-5 text-sm font-bold text-gray-700 transition hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="h-11 rounded-2xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg -600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {creating ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
