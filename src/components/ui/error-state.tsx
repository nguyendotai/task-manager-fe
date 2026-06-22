import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ErrorStateProps = {
  title: string;
  message: string;
  onRetry?: () => void;
  className?: string;
};

export function ErrorState({ title, message, onRetry, className }: ErrorStateProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm dark:border-red-900 dark:bg-red-950/30 dark:text-red-200",
        className
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <AlertCircle className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-bold">{title}</p>
            <p className="mt-1 text-sm leading-6">{message}</p>
          </div>
        </div>
        {onRetry ? (
          <Button variant="primary" size="sm" onClick={onRetry}>
            <RefreshCw className="size-4" />
            Retry
          </Button>
        ) : null}
      </div>
    </div>
  );
}
