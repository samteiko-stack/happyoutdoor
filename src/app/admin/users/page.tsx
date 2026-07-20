import { getAdminUsers } from "@/lib/admin/queries.server";
import { UsersPageClient } from "./users-page-client";

export default async function AdminUsersPage() {
  const users = await getAdminUsers();
  return <UsersPageClient initialUsers={users} />;
}
