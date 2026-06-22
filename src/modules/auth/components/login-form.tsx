"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Eye, LockKeyhole, Mail } from "lucide-react";
import { authService } from "@/modules/auth/services/auth-service";
import {
  authRequestFailed,
  authRequestStarted,
  clearAuthError,
  setCredentials
} from "@/modules/auth/store/auth-slice";
import { getAuthErrorMessage } from "@/modules/auth/utils/error";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

type LoginErrors = {
  email?: string;
  password?: string;
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  function validate() {
    const nextErrors: LoginErrors = {};

    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    } else if (password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      dispatch(authRequestStarted());
      const response = await authService.login({ email, password });
      dispatch(setCredentials(response.data));
      router.replace(searchParams.get("redirect") ?? "/workspaces");
    } catch (submitError) {
      dispatch(authRequestFailed(getAuthErrorMessage(submitError)));
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error ? (
        <div className="rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-700 dark:border-brand-900 dark:bg-brand-950/40 dark:text-brand-200">
          {error}
        </div>
      ) : null}

      <label className="block">
        <span className="text-sm font-bold text-slate-700 dark:text-zinc-200">
          Email
        </span>
        <span className="relative mt-2 block">
          <Mail className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            autoComplete="email"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            placeholder="you@company.com"
          />
        </span>
        {errors.email ? (
          <span className="mt-1 block text-xs font-semibold text-brand-600">
            {errors.email}
          </span>
        ) : null}
      </label>

      <label className="block">
        <span className="text-sm font-bold text-slate-700 dark:text-zinc-200">
          Password
        </span>
        <span className="relative mt-2 block">
          <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            autoComplete="current-password"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-12 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            placeholder="Enter your password"
          />
          <Eye className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
        </span>
        {errors.password ? (
          <span className="mt-1 block text-xs font-semibold text-brand-600">
            {errors.password}
          </span>
        ) : null}
      </label>

      <button
        type="submit"
        disabled={loading}
        className="h-12 w-full rounded-2xl bg-brand-600 px-4 text-sm font-bold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
