import { AppLayout, AppPage } from "@/components/layout";
import { requireAdminUser } from "@/lib/require-workspace";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminUser();

  return (
    <AppLayout>
      <AppPage>{children}</AppPage>
    </AppLayout>
  );
}
