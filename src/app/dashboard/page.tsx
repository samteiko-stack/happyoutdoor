import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapDesign, mapTemplate } from "@/lib/mappers";
import Link from "next/link";
import { Plus, DesignPencil } from "iconoir-react";
import { AppShell, AppNav, PageContainer, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  let designs: ReturnType<typeof mapDesign>[] = [];
  let templates: ReturnType<typeof mapTemplate>[] = [];

  try {
    const admin = createAdminClient();

    const { data: designRows } = await admin
      .from("designs")
      .select("*")
      .eq("user_id", session.user.id)
      .order("updated_at", { ascending: false })
      .limit(6);

    designs = (designRows ?? []).map((row) => mapDesign(row));

    const { data: templateRows } = await admin
      .from("templates")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(3);

    templates = (templateRows ?? []).map(mapTemplate);
  } catch (error) {
    console.error("Dashboard data error:", error);
  }

  const firstName = session.user.name?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";

  return (
    <AppShell surface="subtle">
      <AppNav />

      <PageContainer>
        <PageHeader
          size="display"
          title={`Good ${timeOfDay}, ${firstName}! 👋`}
          description="Ready to design your dream balcony?"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-[var(--spacing-section)]">
          <Link
            href="/designer"
            className="group bg-card rounded-lg p-8 shadow-sm hover:shadow-md transition-all border-2 border-transparent hover:border-accent"
          >
            <div className="flex items-start gap-4">
              <div className="bg-accent/10 p-3 rounded-lg group-hover:bg-accent/20 transition-colors">
                <Plus width={24} height={24} className="text-primary" />
              </div>
              <div>
                <h3 className="text-heading-3 mb-1">New Design</h3>
                <p className="text-body">Start designing a new balcony from scratch</p>
              </div>
            </div>
          </Link>

          <Link
            href="/designs"
            className="group bg-card rounded-lg p-8 shadow-sm hover:shadow-md transition-all border-2 border-transparent hover:border-accent"
          >
            <div className="flex items-start gap-4">
              <div className="bg-accent/10 p-3 rounded-lg group-hover:bg-accent/20 transition-colors">
                <DesignPencil width={24} height={24} className="text-primary" />
              </div>
              <div>
                <h3 className="text-heading-3 mb-1">My Designs</h3>
                <p className="text-body">View and edit all your saved designs</p>
              </div>
            </div>
          </Link>
        </div>

        {templates.length > 0 && (
          <section className="mb-[var(--spacing-section)]">
            <h2 className="text-heading-2 mb-6">Start From a Template</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {templates.map((template) => {
                const itemCount = (() => {
                  try { return JSON.parse(template.layoutData).length; }
                  catch { return 0; }
                })();
                return (
                  <Card key={template.id} className="flex flex-col hover:shadow-md transition-all">
                    <CardContent className="p-6 flex flex-col flex-1">
                      <h3 className="text-heading-3 mb-2">{template.name}</h3>
                      <p className="text-body mb-4">{template.description}</p>
                      <div className="text-caption mb-4">
                        <p>{template.balconyWidthCm}cm × {template.balconyHeightCm}cm</p>
                        {itemCount > 0 && <p>{itemCount} items included</p>}
                      </div>
                      <div className="mt-auto">
                        <Link href={`/designer?template=${template.id}`}>
                          <Button className="w-full" size="sm">Use This Template</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {designs.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-heading-2">Recent Designs</h2>
              <Link href="/designs" className="text-sm text-primary hover:text-primary/80 font-medium">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {designs.map((design) => (
                <Link
                  key={design.id}
                  href={`/designer?id=${design.id}`}
                  className="group bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {design.name}
                    </h3>
                    <DesignPencil width={18} height={18} className="text-muted-foreground" />
                  </div>
                  <div className="text-body">
                    <p>Size: {design.balconyWidthCm}cm × {design.balconyHeightCm}cm</p>
                    <p className="mt-1">
                      Updated {new Date(design.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {designs.length === 0 && (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="bg-accent/10 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <DesignPencil width={32} height={32} className="text-primary" />
              </div>
              <h3 className="text-heading-3 mb-2">No designs yet</h3>
              <p className="text-body mb-6">
                Create your first balcony design and start planning your outdoor space!
              </p>
              <Link href="/designer">
                <Button size="lg">
                  <Plus width={20} height={20} />
                  Create First Design
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </PageContainer>
    </AppShell>
  );
}
