export function WorkspaceListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex items-center gap-3">
            <div className="size-12 animate-pulse rounded-2xl bg-gray-100 dark:bg-zinc-800" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-2/3 animate-pulse rounded-full bg-gray-100 dark:bg-zinc-800" />
              <div className="h-3 w-1/3 animate-pulse rounded-full bg-gray-100 dark:bg-zinc-800" />
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <div className="h-3 animate-pulse rounded-full bg-gray-100 dark:bg-zinc-800" />
            <div className="h-3 w-5/6 animate-pulse rounded-full bg-gray-100 dark:bg-zinc-800" />
            <div className="h-3 w-2/3 animate-pulse rounded-full bg-gray-100 dark:bg-zinc-800" />
          </div>
          <div className="mt-6 h-10 animate-pulse rounded-2xl bg-gray-100 dark:bg-zinc-800" />
        </div>
      ))}
    </div>
  );
}
