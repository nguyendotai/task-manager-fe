import { Suspense } from "react";
import { AuthShell } from "@/modules/auth/components/auth-shell";
import { LoginForm } from "@/modules/auth/components/login-form";

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to your workspace"
      subtitle="Use your account to continue managing projects, boards, and tasks."
      footerText="No account yet?"
      footerHref="/register"
      footerLinkText="Create one"
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
