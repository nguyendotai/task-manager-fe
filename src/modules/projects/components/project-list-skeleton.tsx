export function ProjectListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="h-6 w-24 animate-pulse rounded-full bg-gray-100 dark:bg-zinc-800" />
          <div className="mt-5 h-5 w-2/3 animate-pulse rounded-full bg-gray-100 dark:bg-zinc-800" />
          <div className="mt-5 space-y-2">
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
