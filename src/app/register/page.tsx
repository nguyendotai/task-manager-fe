import { AuthShell } from "@/modules/auth/components/auth-shell";
import { RegisterForm } from "@/modules/auth/components/register-form";

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Start today"
      title="Create your account"
      subtitle="Set up access for your team and start planning workspaces faster."
      footerText="Already have an account?"
      footerHref="/login"
      footerLinkText="Sign in"
    >
      <RegisterForm />
    </AuthShell>
  );
}
