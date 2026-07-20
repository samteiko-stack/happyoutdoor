"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AuthFormCard,
  AuthFormFields,
  AuthFormActions,
  AuthFooterText,
  AuthLink,
  AuthField,
  AuthPasswordField,
} from "@/components/auth";
import { createClient } from "@/lib/supabase/client";

const REMEMBER_KEY = "ho-remember-email";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [remember, setRemember] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY);
    if (saved) {
      setEmail(saved);
      setRemember(true);
    }
    if (searchParams.get("reset") === "success") {
      setSuccessMessage("Your password has been updated. Sign in with your new password.");
    }
    if (searchParams.get("error") === "auth") {
      setError("Your sign-in link expired or is invalid. Please try again.");
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    const formData = new FormData(e.currentTarget);
    const nextEmail = (formData.get("email") as string).trim();
    const password = formData.get("password") as string;

    if (!nextEmail || !password) {
      setError("Enter email and password.");
      setLoading(false);
      return;
    }

    let data;
    try {
      const supabase = createClient();
      const result = await supabase.auth.signInWithPassword({
        email: nextEmail,
        password,
      });
      data = result.data;
      if (result.error) {
        setError(result.error.message || "Invalid email or password");
        setLoading(false);
        return;
      }
    } catch {
      setError("Can't reach the server. Check your connection and try again.");
      setLoading(false);
      return;
    }

    if (!data?.user) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    if (remember) {
      localStorage.setItem(REMEMBER_KEY, nextEmail);
    } else {
      localStorage.removeItem(REMEMBER_KEY);
    }

    router.refresh();

    let role = (data.user?.user_metadata?.role as string | undefined)?.toUpperCase();

    if (!role) {
      try {
        const res = await fetch("/api/auth/profile", { credentials: "include" });
        if (res.ok) {
          const { user } = await res.json();
          role = user.role?.toUpperCase();
        }
      } catch {
        // Ignore and use default redirect below.
      }
    }

    router.push(role === "ADMIN" ? "/admin" : "/dashboard");
    setLoading(false);
  }

  return (
    <AuthFormCard title="Welcome back" description="Sign in to continue.">
      <form onSubmit={handleSubmit}>
        <AuthFormFields>
          {successMessage && (
            <Alert variant="success">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}
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
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <AuthPasswordField
            id="password"
            name="password"
            label="Password"
            placeholder="••••••••••"
            autoComplete="current-password"
            required
          />
          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <AuthLink href="/forgot-password">Forgot password?</AuthLink>
            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <Label
                htmlFor="remember"
                className="cursor-pointer text-sm font-normal text-muted-foreground"
              >
                Remember me
              </Label>
              <Switch
                id="remember"
                checked={remember}
                onCheckedChange={setRemember}
                aria-label="Remember me"
              />
            </div>
          </div>
        </AuthFormFields>
        <AuthFormActions>
          <Button
            type="submit"
            className="h-12 w-full text-base font-semibold"
            disabled={loading}
          >
            {loading ? "Signing in…" : "Log in"}
          </Button>
          <AuthFooterText>
            Don&apos;t have an account? <AuthLink href="/register">Sign up</AuthLink>
          </AuthFooterText>
        </AuthFormActions>
      </form>
    </AuthFormCard>
  );
}

function LoginFallback() {
  return (
    <AuthFormCard title="Welcome back" description="Sign in to continue.">
      <AuthFormFields>
        <div className="h-14 animate-pulse rounded-xl bg-muted" />
        <div className="h-14 animate-pulse rounded-xl bg-muted" />
      </AuthFormFields>
    </AuthFormCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
