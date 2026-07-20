"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AuthFormCard,
  AuthFormFields,
  AuthFormActions,
  AuthFooterText,
  AuthLink,
  AuthPasswordField,
} from "@/components/auth";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function verifySession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setReady(!!session);
      setCheckingSession(false);
    }
    verifySession();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();
    router.push("/login?reset=success");
  }

  if (checkingSession) {
    return (
      <AuthFormCard title="Set new password" description="Verifying your reset link…">
        <AuthFormFields>
          <div className="h-14 animate-pulse rounded-xl bg-muted" />
          <div className="h-14 animate-pulse rounded-xl bg-muted" />
        </AuthFormFields>
      </AuthFormCard>
    );
  }

  if (!ready) {
    return (
      <AuthFormCard
        title="Link expired"
        description="This password reset link is invalid or has already been used."
      >
        <AuthFormFields>
          <Alert variant="destructive">
            <AlertDescription>Request a new reset link to continue.</AlertDescription>
          </Alert>
        </AuthFormFields>
        <AuthFormActions>
          <Button asChild className="h-12 w-full text-base font-semibold" shape="pill">
            <Link href="/forgot-password">Request new link</Link>
          </Button>
          <AuthFooterText>
            <AuthLink href="/login">Back to log in</AuthLink>
          </AuthFooterText>
        </AuthFormActions>
      </AuthFormCard>
    );
  }

  return (
    <AuthFormCard
      title="Set new password"
      description="Choose a strong password for your account."
    >
      <form onSubmit={handleSubmit}>
        <AuthFormFields>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <AuthPasswordField
            id="password"
            name="password"
            label="New password"
            placeholder="At least 6 characters"
            autoComplete="new-password"
            required
          />
          <AuthPasswordField
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm password"
            placeholder="Repeat your new password"
            autoComplete="new-password"
            required
          />
        </AuthFormFields>
        <AuthFormActions>
          <Button
            type="submit"
            className="h-12 w-full text-base font-semibold"
            shape="pill"
            disabled={loading}
          >
            {loading ? "Updating password…" : "Update password"}
          </Button>
          <AuthFooterText>
            <AuthLink href="/login">Back to log in</AuthLink>
          </AuthFooterText>
        </AuthFormActions>
      </form>
    </AuthFormCard>
  );
}
