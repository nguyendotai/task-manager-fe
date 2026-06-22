import { Skeleton } from "@/components/ui";

export function WorkspaceMembersSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <Skeleton className="size-11 rounded-2xl" />
          <div className="min-w-0 flex-1">
            <Skeleton className="h-4 w-40 rounded-full" />
            <Skeleton className="mt-2 h-3 w-56 rounded-full" />
          </div>
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="size-9 rounded-2xl" />
        </div>
      ))}
    </div>
  );
}
