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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-primary font-bold text-xl">
              Happy Balcony
            </Link>
            <span className="text-gray-300">|</span>
            <h1 className="font-semibold">My Designs</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
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
      <div className="max-w-6xl mx-auto px-6 py-8">
        {designs.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-accent/10 rounded flex items-center justify-center mx-auto mb-4">
              <DesignPencil width={28} height={28} className="text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No designs yet</h2>
            <p className="text-muted-foreground mb-6">
              Start by creating your first balcony design!
            </p>
            <Link href="/designer">
              <Button className="bg-primary hover:bg-primary/90">
                <Plus width={16} height={16} className="mr-1" /> Create Your First Design
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {designs.map((design) => (
              <Card key={design.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{design.name}</CardTitle>
                    {design.isPaid ? (
                      <Badge className="bg-primary">Unlocked</Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 rounded p-4 mb-3 text-center">
                    <p className="text-2xl font-bold text-primary">
                      {getItemCount(design.layoutData)}
                    </p>
                    <p className="text-xs text-muted-foreground">products placed</p>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Balcony: {design.balconyWidthCm} x {design.balconyHeightCm} cm</p>
                    <p>Last updated: {new Date(design.updatedAt).toLocaleDateString()}</p>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Link href={`/designer?id=${design.id}`} className="flex-1">
                    <Button variant="outline" className="w-full" size="sm">
                      <EditPencil width={14} height={14} className="mr-1" /> Edit
                    </Button>
                  </Link>
                  {design.isPaid ? (
                    <Link href={`/designs/${design.id}/links`} className="flex-1">
                      <Button className="w-full bg-[#6b7f3b] hover:bg-[#5a6b32]" size="sm">
                        <LinkIcon width={14} height={14} className="mr-1" /> View Links
                      </Button>
                    </Link>
                  ) : (
                    <Link href={`/designs/${design.id}`} className="flex-1">
                      <Button className="w-full bg-[#6b7f3b] hover:bg-[#5a6b32]" size="sm">
                        <Lock width={14} height={14} className="mr-1" /> Unlock
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive/80"
                    onClick={() => handleDelete(design.id)}
                  >
                    <Trash width={14} height={14} />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
