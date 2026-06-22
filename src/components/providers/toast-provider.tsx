"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastItem = ToastInput & {
  id: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  toast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const variantClassName: Record<ToastVariant, string> = {
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-100",
  error:
    "border-red-200 bg-red-50 text-red-900 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-100",
  info:
    "border-gray-200 bg-white text-gray-950 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
};

const iconClassName: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-300" />,
  error: <AlertCircle className="size-5 text-red-600 dark:text-red-300" />,
  info: <Info className="size-5 text-gray-500 dark:text-zinc-300" />
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    ({ variant = "info", ...input }: ToastInput) => {
      const id = crypto.randomUUID();
      setItems((current) => [{ ...input, variant, id }, ...current].slice(0, 4));
      window.setTimeout(() => remove(id), 4500);
    },
    [remove]
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="fixed right-4 top-4 z-[120] grid w-[min(92vw,420px)] gap-3"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "flex gap-3 rounded-2xl border p-4 shadow-soft",
              variantClassName[item.variant]
            )}
          >
            <span className="mt-0.5 shrink-0">{iconClassName[item.variant]}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">{item.title}</p>
              {item.description ? (
                <p className="mt-1 text-sm leading-5 opacity-80">
                  {item.description}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => remove(item.id)}
              className="grid size-7 shrink-0 place-items-center rounded-xl opacity-60 transition hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
