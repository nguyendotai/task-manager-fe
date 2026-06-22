import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
};

export function EmptyState({
  icon,
  title,
  description,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "grid min-h-56 place-items-center rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900",
        className,
      )}
    >
      <div className="max-w-md">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
          {icon}
        </div>
        <h2 className="mt-5 text-xl font-bold text-gray-950 dark:text-zinc-50">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-zinc-400">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
