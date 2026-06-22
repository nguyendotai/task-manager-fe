"use client";

import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";

type AuthShellProps = {
  children: React.ReactNode;
  eyebrow: string;
  title: string;
  subtitle: string;
  footerText: string;
  footerHref: string;
  footerLinkText: string;
};

export function AuthShell({
  children,
  eyebrow,
  title,
  subtitle,
  footerText,
  footerHref,
  footerLinkText
}: AuthShellProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-black dark:text-zinc-50">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_520px]">
        <section className="hidden border-r border-slate-200 bg-white p-10 dark:border-zinc-800 dark:bg-zinc-950 lg:flex lg:flex-col">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-2xl bg-brand-600 text-xl font-bold text-white shadow-lg shadow-brand-600/25">
              S
            </div>
            <div>
              <p className="font-bold">SaaS PM</p>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Project management
              </p>
            </div>
          </div>

          <div className="mt-auto rounded-3xl border border-brand-100 bg-brand-50 p-8 dark:border-brand-900/60 dark:bg-brand-950/30">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-300">
              Project delivery
            </p>
            <h2 className="mt-4 text-4xl font-bold tracking-normal text-slate-950 dark:text-zinc-50">
              Run workspaces, boards, tasks, and client feedback in one place.
            </h2>
            <div className="mt-8 grid grid-cols-3 gap-3">
              {["18 projects", "64 members", "99.9% SLA"].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl bg-white p-4 text-sm font-bold text-slate-700 shadow-sm dark:bg-zinc-900 dark:text-zinc-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex min-h-screen flex-col px-5 py-5 sm:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 lg:hidden">
              <span className="grid size-10 place-items-center rounded-2xl bg-brand-600 font-bold text-white">
                S
              </span>
              <span className="font-bold">SaaS PM</span>
            </Link>
            <div className="hidden lg:block" />

            <button
              type="button"
              aria-label="Toggle theme"
              onClick={toggleTheme}
              className="grid size-11 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:text-brand-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:text-brand-400"
            >
              {theme === "dark" ? (
                <Sun className="size-5" />
              ) : (
                <Moon className="size-5" />
              )}
            </button>
          </div>

          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-normal text-slate-950 dark:text-zinc-50">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-zinc-400">
              {subtitle}
            </p>

            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-soft dark:border-zinc-800 dark:bg-zinc-950">
              {children}
            </div>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-zinc-400">
              {footerText}{" "}
              <Link
                href={footerHref}
                className="font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                {footerLinkText}
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
