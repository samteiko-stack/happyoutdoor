import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { UserMenu } from "@/components/UserMenu";
import { Plus, DesignPencil, Leaf } from "iconoir-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  let designs: any[] = [];
  let templates: any[] = [];

  try {
    // Get user's designs
    designs = await prisma.design.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      take: 6,
    });

    // Get published templates
    templates = await prisma.template.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    });
  } catch (error) {
    console.error("Dashboard data error:", error);
  }

  const firstName = session.user.name?.split(" ")[0] || "there";
  const timeOfDay = new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f4e8] to-[#f0f8f0]">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Leaf width={24} height={24} className="text-primary" />
            <span className="text-xl font-bold text-primary">Happy Balcony</span>
          </Link>
          <UserMenu />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Greeting */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Good {timeOfDay}, {firstName}! 👋
          </h1>
          <p className="text-lg text-muted-foreground">
            Ready to design your dream balcony?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Link
            href="/designer"
            className="group bg-white rounded p-8 shadow-sm hover:shadow-md transition-all border-2 border-transparent hover:border-accent"
          >
            <div className="flex items-start gap-4">
              <div className="bg-accent/10 p-3 rounded group-hover:bg-accent/20 transition-colors">
                <Plus width={24} height={24} className="text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-1">New Design</h3>
                <p className="text-muted-foreground">Start designing a new balcony from scratch</p>
              </div>
            </div>
          </Link>

          <Link
            href="/designs"
            className="group bg-white rounded p-8 shadow-sm hover:shadow-md transition-all border-2 border-transparent hover:border-accent"
          >
            <div className="flex items-start gap-4">
              <div className="bg-accent/10 p-3 rounded group-hover:bg-accent/20 transition-colors">
                <DesignPencil width={24} height={24} className="text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-1">My Designs</h3>
                <p className="text-muted-foreground">View and edit all your saved designs</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Templates Section */}
        {templates.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Start From a Template</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {templates.map((template) => {
                const itemCount = (() => { 
                  try { return JSON.parse(template.layoutData).length; } 
                  catch { return 0; } 
                })();
                return (
                  <div
                    key={template.id}
                    className="group bg-white rounded p-6 shadow-sm hover:shadow-md transition-all flex flex-col"
                  >
                    <h3 className="font-semibold text-foreground mb-2">
                      {template.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {template.description}
                    </p>
                    <div className="text-xs text-muted-foreground mb-4">
                      <p>{template.balconyWidthCm}cm × {template.balconyHeightCm}cm</p>
                      {itemCount > 0 && <p>{itemCount} items included</p>}
                    </div>
                    <div className="mt-auto">
                    <Link href={`/designer?template=${template.id}`}>
                      <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded text-sm font-medium transition-colors">
                        Use This Template
                      </button>
                    </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Designs */}
        {designs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Recent Designs</h2>
              <Link
                href="/designs"
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                View all →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {designs.map((design) => (
                <Link
                  key={design.id}
                  href={`/designer?id=${design.id}`}
                  className="group bg-white rounded p-6 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {design.name}
                    </h3>
                    <DesignPencil width={18} height={18} className="text-muted-foreground" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Size: {design.balconyWidthCm}cm × {design.balconyHeightCm}cm</p>
                    <p className="mt-1">
                      Updated {new Date(design.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {designs.length === 0 && (
          <div className="bg-white rounded p-12 text-center shadow-sm">
            <div className="max-w-md mx-auto">
              <div className="bg-accent/10 w-16 h-16 rounded flex items-center justify-center mx-auto mb-4">
                <DesignPencil width={32} height={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No designs yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first balcony design and start planning your outdoor space!
              </p>
              <Link
                href="/designer"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded font-medium transition-colors"
              >
                <Plus width={20} height={20} />
                Create First Design
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
