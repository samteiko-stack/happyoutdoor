export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
};

export function isAdmin(user: AuthUser | { role?: string | null }) {
  return user.role?.toUpperCase() === "ADMIN";
}
