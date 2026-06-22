import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type ModalProps = {
  open: boolean;
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  onClose: () => void;
};

export function Modal({ open, title, eyebrow, children, onClose }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-black/45 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-5 shadow-soft dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            {eyebrow ? (
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-red-600 dark:text-red-500">
                {eyebrow}
              </p>
            ) : null}
            <h2 className="mt-2 text-2xl font-bold text-gray-950 dark:text-zinc-50">
              {title}
            </h2>
          </div>
          <Button variant="secondary" size="icon" onClick={onClose} aria-label="Close modal">
            <X className="size-5" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
