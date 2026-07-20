"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AuthFormCard,
  AuthFormFields,
  AuthFormActions,
  AuthFooterText,
  AuthLink,
  AuthField,
} from "@/components/auth";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`;

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });

      if (resetError) {
        setError(resetError.message);
        setLoading(false);
        return;
      }
    } catch {
      setError("Can't reach the server. Check your connection and try again.");
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <AuthFormCard
        title="Check your email"
        description="If an account exists for that address, we sent a password reset link."
      >
        <AuthFormFields>
          <Alert variant="success">
            <AlertDescription>
              We sent instructions to <span className="font-medium text-foreground">{email}</span>.
              The link expires after a short time.
            </AlertDescription>
          </Alert>
        </AuthFormFields>
        <AuthFormActions>
          <Button
            type="button"
            variant="outline"
            className="h-12 w-full text-base font-semibold"
            onClick={() => {
              setSent(false);
              setEmail("");
            }}
          >
            Send another link
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
      title="Reset your password"
      description="Enter your email and we’ll send you a link to choose a new password."
    >
      <form onSubmit={handleSubmit}>
        <AuthFormFields>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <AuthField
            id="email"
            name="email"
            type="email"
            label="Email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </AuthFormFields>
        <AuthFormActions>
          <Button
            type="submit"
            className="h-12 w-full text-base font-semibold"
            disabled={loading}
          >
            {loading ? "Sending link…" : "Send reset link"}
          </Button>
          <AuthFooterText>
            Remember your password? <AuthLink href="/login">Log in</AuthLink>
          </AuthFooterText>
        </AuthFormActions>
      </form>
    </AuthFormCard>
  );
}
