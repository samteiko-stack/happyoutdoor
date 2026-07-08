"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, DesignPencil, EditPencil, Link as LinkIcon, Trash, Lock } from "iconoir-react";
import { AppShell, AppNav, PageContainer, PageHeader, EmptyState, LoadingState } from "@/components/layout";
import { StatusBadge } from "@/components/admin";

interface Design {
  id: string;
  name: string;
  balconyWidthCm: number;
  balconyHeightCm: number;
  isPaid: boolean;
  layoutData: string;
  thumbnailUrl: string | null;
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
    return <LoadingState message="Loading your designs..." />;
  }

  return (
    <AppShell>
      <AppNav
        actions={
          <>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">Dashboard</Button>
            </Link>
            <Link href="/designer">
              <Button size="sm">
                <Plus width={16} height={16} />
                New Design
              </Button>
            </Link>
          </>
        }
      />

      <PageContainer>
        <PageHeader
          title="My Designs"
          description="Manage and edit your balcony designs"
        />

        {designs.length === 0 ? (
          <EmptyState
            icon={<DesignPencil width={36} height={36} className="text-primary" />}
            title="No designs yet"
            description="Start by creating your first balcony design and bring your outdoor space to life!"
            action={{
              label: "Create Your First Design",
              href: "/designer",
              icon: <Plus width={20} height={20} className="mr-2" />,
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {designs.map((design) => (
              <Card key={design.id} className="group hover:shadow-lg transition-all border-2 hover:border-accent/50 flex flex-col overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="mb-3">
                    <StatusBadge status={design.isPaid ? "unlocked" : "draft"} />
                  </div>
                  <CardTitle className="text-heading-3">{design.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 pb-4">
                  <div className="rounded-lg mb-4 overflow-hidden border border-accent/20 bg-accent/5 aspect-video relative">
                    {design.thumbnailUrl ? (
                      <Image
                        src={design.thumbnailUrl}
                        alt={design.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                        <p className="text-4xl font-bold text-primary">{getItemCount(design.layoutData)}</p>
                        <p className="text-body">products placed</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 text-body">
                    <p>
                      <span className="font-medium text-foreground">Balcony:</span>{" "}
                      {design.balconyWidthCm} × {design.balconyHeightCm} cm
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Updated:</span>{" "}
                      {new Date(design.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2 pt-4 border-t">
                  <Link href={`/designer?id=${design.id}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      <EditPencil width={16} height={16} />
                      Edit
                    </Button>
                  </Link>
                  <div className="flex gap-2 w-full">
                    {design.isPaid ? (
                      <Link href={`/designs/${design.id}/links`} className="flex-1">
                        <Button className="w-full">
                          <LinkIcon width={16} height={16} />
                          View Links
                        </Button>
                      </Link>
                    ) : (
                      <Link href={`/designs/${design.id}`} className="flex-1">
                        <Button className="w-full">
                          <Lock width={16} height={16} />
                          Unlock
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
      </PageContainer>
    </AppShell>
  );
}
