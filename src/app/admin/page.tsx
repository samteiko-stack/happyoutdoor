import { createAdminClient } from "@/lib/supabase/admin";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TableCell } from "@/components/ui/table";
import { AdminPageHeader, DataTableCard, StatusBadge, TableRowDefault } from "@/components/admin";
import { mapDesign, mapProfile } from "@/lib/mappers";

async function getStats() {
  const admin = createAdminClient();

  const [users, products, designs] = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin.from("products").select("*", { count: "exact", head: true }),
    admin.from("designs").select("*", { count: "exact", head: true }),
  ]);

  return {
    usersCount: users.count ?? 0,
    productsCount: products.count ?? 0,
    designsCount: designs.count ?? 0,
    paymentsCount: 0,
  };
}

async function getRecentDesigns() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("designs")
    .select("*, profiles(name, email)")
    .order("created_at", { ascending: false })
    .limit(10);

  return (data ?? []).map((row) => ({
    ...mapDesign(row),
    user: row.profiles
      ? mapProfile({ ...row.profiles, id: row.user_id, role: "USER", created_at: "", updated_at: "" })
      : { name: null, email: "" },
  }));
}

export default async function AdminOverviewPage() {
  const [stats, recentDesigns] = await Promise.all([getStats(), getRecentDesigns()]);

  const statCards = [
    { title: "Total Users", value: stats.usersCount, description: "Registered users" },
    { title: "Total Products", value: stats.productsCount, description: "Products in catalog" },
    { title: "Total Designs", value: stats.designsCount, description: "User-created designs" },
    { title: "Total Payments", value: stats.paymentsCount, description: "Completed payments" },
  ];

  return (
    <div className="space-y-8">
      <AdminPageHeader title="Overview" description="Quick stats and recent activity" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardDescription className="text-muted-foreground">{stat.description}</CardDescription>
              <CardTitle className="text-foreground text-2xl">
                {stat.value.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium text-foreground">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <DataTableCard
        title="Recent Designs"
        description="Latest designs created by users"
        columns={["Design", "User", "Status", "Created"]}
        isEmpty={recentDesigns.length === 0}
        emptyMessage="No designs yet"
      >
        {recentDesigns.map((design) => (
          <TableRowDefault key={design.id}>
            <TableCell className="font-medium text-foreground">{design.name}</TableCell>
            <TableCell className="text-muted-foreground">
              {(design as { user?: { name?: string | null; email?: string } }).user?.name ||
                (design as { user?: { email?: string } }).user?.email}
            </TableCell>
            <TableCell>
              <StatusBadge status={design.isPaid ? "paid" : "draft"} />
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {new Date(design.createdAt).toLocaleDateString()}
            </TableCell>
          </TableRowDefault>
        ))}
      </DataTableCard>
    </div>
  );
}
