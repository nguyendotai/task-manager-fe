"use client";

import Link from "next/link";
import { ArrowUpRight, CalendarDays, FolderKanban } from "lucide-react";
import { ProjectStatusBadge } from "@/modules/projects/components/project-status-badge";
import type { Project } from "@/modules/projects/types";

type ProjectCardProps = {
  project: Project;
  workspaceId: string;
};

export function ProjectCard({ project, workspaceId }: ProjectCardProps) {
  return (
    <Link
      href={`/workspaces/${workspaceId}/projects/${project.id}`}
      className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-red-200 hover:shadow-soft dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-red-900/70"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-3">
            <ProjectStatusBadge status={project.status} />
          </div>
          <h3 className="truncate text-lg font-bold text-gray-950 dark:text-zinc-50">
            {project.name}
          </h3>
        </div>

        <span className="grid size-9 shrink-0 place-items-center rounded-2xl border border-gray-200 text-gray-400 transition group-hover:border-red-200 group-hover:text-red-600 dark:border-zinc-800 dark:group-hover:border-red-900/70 dark:group-hover:text-red-500">
          <ArrowUpRight className="size-4" />
        </span>
      </div>

      <p className="mt-4 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-gray-500 dark:text-zinc-400">
        {project.description || "No description has been added yet."}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 dark:border-zinc-800">
        <span className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-zinc-400">
          <FolderKanban className="size-4 text-red-600 dark:text-red-500" />
          Project
        </span>
        <span className="flex items-center justify-end gap-2 text-xs font-bold text-gray-500 dark:text-zinc-400">
          <CalendarDays className="size-4" />
          {project.createdAt
            ? new Date(project.createdAt).toLocaleDateString()
            : "New"}
        </span>
      </div>
    </Link>
  );
}
