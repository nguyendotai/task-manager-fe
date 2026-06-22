"use client";

import { FormEvent, useEffect, useState } from "react";
import { AlertCircle, Mail, Send } from "lucide-react";
import { Button, Input, Modal } from "@/components/ui";
import { useToast } from "@/components/providers/toast-provider";
import {
  getWorkspaceMemberApiError,
  useInviteWorkspaceMemberMutation,
} from "@/features/workspace-members/api/workspace-members-api";
import type {
  InvitationRole,
  WorkspaceRole,
} from "@/features/workspace-members/types";
import {
  canAssignRole,
  inviteRoles,
  roleDescription,
  roleLabel,
} from "@/features/workspace-members/utils/role-utils";

type InviteMemberModalProps = {
  open: boolean;
  workspaceId: string;
  actorRole: WorkspaceRole | null;
  onClose: () => void;
};

type FormErrors = {
  email?: string;
  role?: string;
};

export function InviteMemberModal({
  open,
  workspaceId,
  actorRole,
  onClose,
}: InviteMemberModalProps) {
  const { toast } = useToast();
  const [inviteMember, { isLoading }] = useInviteWorkspaceMemberMutation();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InvitationRole>("MEMBER");
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!open) {
      setEmail("");
      setRole("MEMBER");
      setErrors({});
    }
  }, [open]);

  if (!open) {
    return null;
  }

  function validate() {
    const nextErrors: FormErrors = {};

    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!canAssignRole(actorRole, role)) {
      nextErrors.role = "You cannot invite a member with this role.";
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
      await inviteMember({
        workspaceId,
        data: {
          email: email.trim(),
          role,
        },
      }).unwrap();
      toast({
        title: "Invitation sent",
        description: `${email.trim()} was invited as ${roleLabel[role]}.`,
        variant: "success",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Unable to invite member",
        description:
          getWorkspaceMemberApiError(error) ||
          "You do not have permission to invite members.",
        variant: "error",
      });
    }
  }

  return (
    <Modal
      open={open}
      title="Invite member"
      eyebrow="Members"
      onClose={onClose}
    >
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm font-bold text-gray-700 dark:text-zinc-200">
            Email
          </span>
          <span className="relative mt-2 block">
            <Mail className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
            <Input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              autoComplete="email"
              className="pl-12"
              placeholder="teammate@company.com"
            />
          </span>
          {errors.email ? (
            <span className="mt-1 block text-xs font-semibold text-blue-600 dark:text-blue-400">
              {errors.email}
            </span>
          ) : null}
        </label>

        <label className="block">
          <span className="text-sm font-bold text-gray-700 dark:text-zinc-200">
            Role
          </span>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as InvitationRole)}
            className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
          >
            {inviteRoles.map((item) => (
              <option
                key={item}
                value={item}
                disabled={!canAssignRole(actorRole, item)}
                title={
                  canAssignRole(actorRole, item)
                    ? roleDescription[item]
                    : "You cannot invite a role equal to or above your role."
                }
              >
                {roleLabel[item]}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs leading-5 text-gray-500 dark:text-zinc-400">
            {roleDescription[role]}
          </p>
          {errors.role ? (
            <span className="mt-1 flex gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
              <AlertCircle className="size-3.5" />
              {errors.role}
            </span>
          ) : null}
        </label>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Send className="size-4" />
            {isLoading ? "Sending..." : "Send invite"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
