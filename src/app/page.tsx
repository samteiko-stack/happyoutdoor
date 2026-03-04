import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { UserMenu } from "@/components/UserMenu";
import { HowItWorksIcons } from "@/components/HowItWorksIcons";

export default async function HomePage() {
  const session = await auth();
  
  // Redirect logged-in users to appropriate dashboard
  if (session?.user) {
    const userRole = (session.user as any).role;
    if (userRole === "ADMIN") {
      redirect("/admin");
    } else {
      redirect("/dashboard");
    }
  }
  
  let templates: Array<{
    id: string;
    name: string;
    description: string | null;
    balconyWidthCm: number;
    balconyHeightCm: number;
    layoutData: string;
  }> = [];
  let productCount = 0;
  let categoryCount = 0;

  try {
    templates = await prisma.template.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    productCount = await prisma.product.count();
    categoryCount = await prisma.category.count();
  } catch (error) {
    console.error("Database query error:", error);
  }

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="text-primary font-bold text-xl">
            Happy Balcony
          </Link>
          <UserMenu />
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-background via-secondary/30 to-secondary/20 py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 mb-6">
            Design Your Dream
            <span className="text-primary"> Balcony</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Choose from curated products, arrange them on a top-view canvas, and get
            direct links to purchase everything you need. It&apos;s that simple.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href={session ? "/designer" : "/register"}>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-6">
                Start Designing
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                How It Works
              </Button>
            </a>
          </div>
          <div className="flex items-center justify-center gap-8 mt-12 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">{productCount}</span>
              <span>Products</span>
            </div>
            <div className="w-px h-6 bg-gray-300" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">{categoryCount}</span>
              <span>Categories</span>
            </div>
            <div className="w-px h-6 bg-gray-300" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">Free</span>
              <span>to Design</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <HowItWorksIcons />
        </div>
      </section>

      {/* Templates */}
      {templates.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-4">Start From a Template</h2>
            <p className="text-center text-gray-600 mb-12">
              Pick a pre-designed layout and customize it to your taste
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => {
                const itemCount = (() => { try { return JSON.parse(template.layoutData).length; } catch { return 0; } })();
                return (
                  <Card key={template.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle>{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-secondary/20 rounded p-4 mb-4 text-center">
                        <p className="text-sm text-primary">
                          {template.balconyWidthCm} x {template.balconyHeightCm} cm
                          {itemCount > 0 && ` · ${itemCount} products`}
                        </p>
                      </div>
                      <Link href={session ? `/designer?template=${template.id}` : "/register"}>
                        <Button className="w-full bg-primary hover:bg-primary/90">
                          Use This Template
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Balcony?</h2>
          <p className="text-secondary/80 text-lg mb-8">
            Join and start designing your perfect outdoor space today. It&apos;s free to create designs!
          </p>
          <Link href={session ? "/designer" : "/register"}>
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              {session ? "Open Designer" : "Create Free Account"}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="font-bold text-white text-lg mb-2">Happy Balcony</p>
          <p className="text-sm">Design beautiful outdoor spaces with curated products</p>
          <p className="text-xs mt-4">&copy; {new Date().getFullYear()} Happy Balcony. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
