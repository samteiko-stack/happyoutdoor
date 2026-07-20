"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { useSession } from "@/components/providers/SupabaseProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const userRole = session.user.role?.toUpperCase();
      router.push(userRole === "ADMIN" ? "/admin" : "/dashboard");
    }
  }, [status, session, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = (formData.get("name") as string).trim();
    const email = (formData.get("email") as string).trim();
    const password = formData.get("password") as string;

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
    } catch {
      setError("Can't reach the server. Check your connection and try again.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <AuthFormCard
      title="Create account"
      description="Start designing your balcony."
    >
      <form onSubmit={handleSubmit}>
        <AuthFormFields>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <AuthField
            id="name"
            name="name"
            type="text"
            label="Full name"
            placeholder="Jane Smith"
            autoComplete="name"
          />
          <AuthField
            id="email"
            name="email"
            type="email"
            label="Email"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
          <AuthPasswordField
            id="password"
            name="password"
            label="Password"
            placeholder="At least 6 characters"
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
            {loading ? "Creating account…" : "Sign up"}
          </Button>
          <AuthFooterText>
            Already have an account? <AuthLink href="/login">Log in</AuthLink>
          </AuthFooterText>
        </AuthFormActions>
      </form>
    </AuthFormCard>
  );
}
