import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

async function getStats() {
  const [usersCount, productsCount, designsCount, paymentsCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.design.count(),
      prisma.payment.count(),
    ]);

  return { usersCount, productsCount, designsCount, paymentsCount };
}

async function getRecentDesigns() {
  return prisma.design.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
    },
  });
}

export default async function AdminOverviewPage() {
  const [stats, recentDesigns] = await Promise.all([
    getStats(),
    getRecentDesigns(),
  ]);

  const statCards = [
    { title: "Total Users", value: stats.usersCount, description: "Registered users" },
    { title: "Total Products", value: stats.productsCount, description: "Products in catalog" },
    { title: "Total Designs", value: stats.designsCount, description: "User-created designs" },
    { title: "Total Payments", value: stats.paymentsCount, description: "Completed payments" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-semibold text-foreground text-2xl">Overview</h2>
        <p className="text-primary text-sm mt-1">
          Quick stats and recent activity
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-border bg-white">
            <CardHeader className="pb-2">
              <CardDescription className="text-primary">
                {stat.description}
              </CardDescription>
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

      <Card className="border-border bg-white">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Designs</CardTitle>
          <CardDescription className="text-primary">
            Latest designs created by users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-foreground">Design</TableHead>
                <TableHead className="text-foreground">User</TableHead>
                <TableHead className="text-foreground">Status</TableHead>
                <TableHead className="text-foreground">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentDesigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-primary py-8">
                    No designs yet
                  </TableCell>
                </TableRow>
              ) : (
                recentDesigns.map((design) => (
                  <TableRow key={design.id} className="border-secondary/20">
                    <TableCell className="font-medium text-foreground">
                      {design.name}
                    </TableCell>
                    <TableCell className="text-primary">
                      {design.user.name || design.user.email}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded px-2 py-1 text-xs font-medium ${
                          design.isPaid
                            ? "bg-secondary/20 text-foreground"
                            : "bg-secondary/10 text-primary"
                        }`}
                      >
                        {design.isPaid ? "Paid" : "Draft"}
                      </span>
                    </TableCell>
                    <TableCell className="text-primary text-sm">
                      {design.createdAt.toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
