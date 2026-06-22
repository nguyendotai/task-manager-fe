"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  AlertCircle,
  Check,
  Layers3,
  Pencil,
  Plus,
  RefreshCw,
  Tags,
  Trash2,
  X
} from "lucide-react";
import {
  Button,
  EmptyState,
  ErrorState,
  Input,
  Skeleton
} from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  clearLabelErrors,
  createLabel,
  deleteLabel,
  fetchLabelsByWorkspace,
  updateLabel
} from "@/modules/labels/store/label-slice";
import type { Label } from "@/modules/labels/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

type LabelManagerProps = {
  workspaceId: string;
  open: boolean;
  onClose: () => void;
};

const defaultColors = [
  "#dc2626",
  "#f97316",
  "#ca8a04",
  "#16a34a",
  "#0891b2",
  "#2563eb",
  "#7c3aed",
  "#db2777"
];

export function LabelManager({ workspaceId, open, onClose }: LabelManagerProps) {
  const dispatch = useAppDispatch();
  const { items, loading, creating, updating, deleting, error, mutationError } =
    useAppSelector((state) => state.labels);
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(defaultColors[0]);

  useEffect(() => {
    dispatch(fetchLabelsByWorkspace(workspaceId));
  }, [dispatch, workspaceId]);

  useEffect(() => {
    if (open) {
      dispatch(clearLabelErrors());
      return;
    }

    setEditingLabel(null);
    setName("");
    setColor(defaultColors[0]);
  }, [dispatch, open]);

  function resetForm() {
    setEditingLabel(null);
    setName("");
    setColor(defaultColors[0]);
    dispatch(clearLabelErrors());
  }

  function closePanel() {
    onClose();
    resetForm();
  }

  function startEdit(label: Label) {
    dispatch(clearLabelErrors());
    setEditingLabel(label);
    setName(label.name);
    setColor(label.color);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (name.trim().length < 2) {
      return;
    }

    if (editingLabel) {
      const result = await dispatch(
        updateLabel({
          labelId: editingLabel.id,
          data: { name: name.trim(), color }
        })
      );

      if (updateLabel.fulfilled.match(result)) {
        resetForm();
      }

      return;
    }

    const result = await dispatch(
      createLabel({
        name: name.trim(),
        color,
        workspace: workspaceId,
        workspaceId
      })
    );

    if (createLabel.fulfilled.match(result)) {
      resetForm();
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[75]">
      <button
        type="button"
        aria-label="Close label panel"
        onClick={closePanel}
        className="absolute inset-0 bg-black/35 backdrop-blur-sm"
      />

      <aside className="absolute right-4 top-4 flex max-h-[calc(100vh-2rem)] w-[min(94vw,720px)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 md:right-6 md:top-6">
        <header className="flex items-start justify-between gap-4 border-b border-gray-100 p-5 dark:border-zinc-800">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-red-600 dark:text-red-500">
              <Layers3 className="size-4" />
              Label Panel
            </p>
            <h3 className="mt-2 text-2xl font-bold text-gray-950 dark:text-zinc-50">
              Create and manage labels
            </h3>
            <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-zinc-400">
              Create labels here, then use them in task filters and task forms.
            </p>
          </div>

          <Button
            variant="secondary"
            size="icon"
            onClick={closePanel}
            aria-label="Close label panel"
          >
            <X className="size-5" />
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-5">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_170px_auto]">
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Label name"
                aria-label="Label name"
              />
              <label className="flex h-12 items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 dark:border-zinc-800 dark:bg-zinc-950">
                <span
                  className="size-5 rounded-full ring-1 ring-black/10"
                  style={{ backgroundColor: color }}
                />
                <input
                  type="color"
                  value={color}
                  onChange={(event) => setColor(event.target.value)}
                  className="h-9 w-full cursor-pointer bg-transparent"
                  aria-label="Label color"
                />
              </label>
              <Button
                type="submit"
                disabled={creating || updating || name.trim().length < 2}
                className="h-12"
              >
                {editingLabel ? (
                  <Check className="size-4" />
                ) : (
                  <Plus className="size-4" />
                )}
                {editingLabel ? "Save" : "Create"}
              </Button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {defaultColors.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-label={`Use color ${item}`}
                  onClick={() => setColor(item)}
                  className={cn(
                    "size-8 rounded-full ring-2 ring-white transition hover:scale-105 dark:ring-zinc-900",
                    color === item &&
                      "outline outline-2 outline-offset-2 outline-red-500"
                  )}
                  style={{ backgroundColor: item }}
                />
              ))}
              {editingLabel ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resetForm}
                >
                  <X className="size-3.5" />
                  Cancel edit
                </Button>
              ) : null}
            </div>

            {mutationError ? (
              <div className="mt-3 flex gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
                <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                <span>{mutationError}</span>
              </div>
            ) : null}
          </form>

          <div className="mt-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-gray-950 dark:text-zinc-50">
                All labels ({items.length})
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => dispatch(fetchLabelsByWorkspace(workspaceId))}
              >
                <RefreshCw className="size-4" />
                Refresh
              </Button>
            </div>

            {loading ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-20 rounded-2xl" />
                ))}
              </div>
            ) : null}

            {!loading && error ? (
              <ErrorState
                title="Unable to load labels"
                message={error}
                onRetry={() => dispatch(fetchLabelsByWorkspace(workspaceId))}
              />
            ) : null}

            {!loading && !error && items.length === 0 ? (
              <EmptyState
                icon={<Tags className="size-7" />}
                title="No labels yet"
                description="Create the first workspace label from the form above."
                className="min-h-48"
              />
            ) : null}

            {!loading && !error && items.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {items.map((label) => (
                  <LabelRow
                    key={label.id}
                    label={label}
                    deleting={deleting}
                    onEdit={() => startEdit(label)}
                    onDelete={() => dispatch(deleteLabel(label.id))}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </aside>
    </div>
  );
}

function LabelRow({
  label,
  deleting,
  onEdit,
  onDelete
}: {
  label: Label;
  deleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="min-w-0">
        <span
          className="inline-flex max-w-full items-center gap-2 rounded-full px-3 py-1 text-xs font-bold text-white"
          style={{ backgroundColor: label.color }}
        >
          <span className="truncate">{label.name}</span>
        </span>
        <p className="mt-2 truncate text-xs font-semibold text-gray-400">
          {label.color}
        </p>
      </div>
      <div className="flex shrink-0 gap-1">
        <button
          type="button"
          aria-label={`Edit ${label.name}`}
          onClick={onEdit}
          className="grid size-8 place-items-center rounded-xl text-gray-400 transition hover:bg-gray-50 hover:text-red-600 dark:hover:bg-zinc-800 dark:hover:text-red-400"
        >
          <Pencil className="size-4" />
        </button>
        <button
          type="button"
          disabled={deleting}
          aria-label={`Delete ${label.name}`}
          onClick={onDelete}
          className="grid size-8 place-items-center rounded-xl text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-60 dark:hover:bg-red-950/30 dark:hover:text-red-400"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  );
}
