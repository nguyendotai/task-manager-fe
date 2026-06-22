import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type DrawerProps = {
  open: boolean;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClose: () => void;
};

export function Drawer({ open, title, children, footer, onClose }: DrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90]">
      <button
        type="button"
        aria-label="Close drawer"
        onClick={onClose}
        className="absolute inset-0 bg-black/35 backdrop-blur-sm"
      />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col border-l border-gray-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        <header className="flex items-start justify-between gap-4 border-b border-gray-100 p-5 dark:border-zinc-800">
          <h2 className="text-2xl font-bold leading-8 text-gray-950 dark:text-zinc-50">
            {title}
          </h2>
          <Button variant="secondary" size="icon" onClick={onClose} aria-label="Close drawer">
            <X className="size-5" />
          </Button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer ? (
          <div className="border-t border-gray-100 p-4 dark:border-zinc-800">
            {footer}
          </div>
        ) : null}
      </aside>
    </div>
  );
}
