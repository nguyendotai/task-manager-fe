import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-blue-500 dark:focus:ring-blue-500/10",
      className,
    )}
    {...props}
  />
));

Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm leading-6 text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-blue-500 dark:focus:ring-blue-500/10",
      className,
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";
