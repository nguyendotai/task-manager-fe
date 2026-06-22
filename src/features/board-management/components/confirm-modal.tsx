"use client";

import { AlertTriangle } from "lucide-react";
import { Button, Modal } from "@/components/ui";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  eyebrow?: string;
  message: string;
  confirmLabel: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmModal({
  open,
  title,
  eyebrow = "Confirm",
  message,
  confirmLabel,
  loading,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  return (
    <Modal open={open} title={title} eyebrow={eyebrow} onClose={onClose}>
      <div className="mt-6 space-y-5">
        <div className="flex gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-blue-800 dark:border-blue-900/70 dark:bg-blue-950/30 dark:text-blue-200">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>{message}</span>
        </div>
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? "Working..." : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
