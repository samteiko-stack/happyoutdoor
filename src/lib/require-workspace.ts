import { auth } from "@/lib/auth.server";
import { redirect } from "next/navigation";
import { isAdminRole } from "@/lib/auth-routes";

/** Redirect admins away from customer-only pages. */
export async function requireCustomerUser() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (isAdminRole(session.user.role)) {
    redirect("/admin");
  }
  return session;
}

/** Redirect non-admins away from admin pages. */
export async function requireAdminUser() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (!isAdminRole(session.user.role)) {
    redirect("/dashboard");
  }
  return session;
}
