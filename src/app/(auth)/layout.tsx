import type { Metadata } from "next";
import { AuthShell } from "@/components/auth";

export const metadata: Metadata = {
  title: {
    template: "%s · Happy Outdoors",
    default: "Sign in · Happy Outdoors",
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthShell>{children}</AuthShell>;
}
