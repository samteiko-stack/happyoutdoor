"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserMenu } from "@/components/UserMenu";
import { Plus, DesignPencil, EditPencil, Link as LinkIcon, Trash, Lock } from "iconoir-react";

interface Design {
  id: string;
  name: string;
  balconyWidthCm: number;
  balconyHeightCm: number;
  isPaid: boolean;
  layoutData: string;
  createdAt: string;
  updatedAt: string;
}

export default function DesignsPage() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDesigns = useCallback(async () => {
    const res = await fetch("/api/designs");
    if (res.ok) {
      setDesigns(await res.json());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDesigns();
  }, [fetchDesigns]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this design? This cannot be undone.")) return;
    const res = await fetch(`/api/designs/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Design deleted");
      fetchDesigns();
    } else {
      toast.error("Failed to delete");
    }
  }

  function getItemCount(layoutData: string): number {
    try {
      return JSON.parse(layoutData).length;
    } catch {
      return 0;
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading your designs...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="bg-card border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-primary font-bold text-xl hover:text-primary/80 transition-colors">
              Happy Balcony
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                Dashboard
              </Button>
            </Link>
            <Link href="/designer">
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                <Plus width={16} height={16} className="mr-1" /> New Design
              </Button>
            </Link>
            <UserMenu />
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Page Title */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Designs</h1>
          <p className="text-muted-foreground">Manage and edit your balcony designs</p>
        </div>

        {designs.length === 0 ? (
          <div className="bg-card rounded-lg border p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <DesignPencil width={36} height={36} className="text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">No designs yet</h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Start by creating your first balcony design and bring your outdoor space to life!
              </p>
              <Link href="/designer">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  <Plus width={20} height={20} className="mr-2" /> Create Your First Design
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {designs.map((design) => (
              <Card key={design.id} className="group hover:shadow-lg transition-all border-2 hover:border-accent/50 flex flex-col overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="mb-3">
                    {design.isPaid ? (
                      <Badge className="bg-primary">Unlocked</Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    {design.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 pb-4">
                  <div className="bg-accent/5 rounded-lg p-6 mb-4 text-center border border-accent/20">
                    <p className="text-4xl font-bold text-primary mb-1">
                      {getItemCount(design.layoutData)}
                    </p>
                    <p className="text-sm text-muted-foreground">products placed</p>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <span className="font-medium text-foreground">Balcony:</span>
                      {design.balconyWidthCm} × {design.balconyHeightCm} cm
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium text-foreground">Updated:</span>
                      {new Date(design.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2 pt-4 border-t">
                  <Link href={`/designer?id=${design.id}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      <EditPencil width={16} height={16} className="mr-2" /> Edit
                    </Button>
                  </Link>
                  <div className="flex gap-2 w-full">
                    {design.isPaid ? (
                      <Link href={`/designs/${design.id}/links`} className="flex-1">
                        <Button className="w-full bg-primary hover:bg-primary/90">
                          <LinkIcon width={16} height={16} className="mr-2" /> View Links
                        </Button>
                      </Link>
                    ) : (
                      <Link href={`/designs/${design.id}`} className="flex-1">
                        <Button className="w-full bg-primary hover:bg-primary/90">
                          <Lock width={16} height={16} className="mr-2" /> Unlock
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(design.id)}
                      title="Delete design"
                    >
                      <Trash width={18} height={18} />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
