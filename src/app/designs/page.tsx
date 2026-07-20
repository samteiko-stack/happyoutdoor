"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { AppLayout, AppPage, LoadingState, PageStack } from "@/components/layout";
import { DesignPreviewCard } from "@/components/dashboard/design-preview-card";
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";

interface Design {
  id: string;
  name: string;
  balconyWidthCm: number;
  balconyHeightCm: number;
  isPaid: boolean;
  layoutData: string;
  thumbnailUrl: string | null;
  updatedAt: string;
}

export default function DesignsPage() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDesigns = useCallback(async () => {
    const res = await fetch("/api/designs", { cache: "no-store" });
    if (res.ok) {
      setDesigns(await res.json());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDesigns();
  }, [fetchDesigns]);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    const res = await fetch(`/api/designs/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Design deleted");
      fetchDesigns();
    } else {
      toast.error("Failed to delete");
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <AppPage>
          <LoadingState message="Loading designs…" />
        </AppPage>
      </AppLayout>
    );
  }

  const draftCount = designs.filter((d) => !d.isPaid).length;
  const meta =
    designs.length === 0
      ? undefined
      : `${designs.length} design${designs.length === 1 ? "" : "s"}${draftCount > 0 ? ` · ${draftCount} draft${draftCount === 1 ? "" : "s"}` : ""}`;

  return (
    <AppLayout>
      <AppPage>
        <PageStack>
          {meta && <p className="text-body">{meta}</p>}

          {designs.length === 0 ? (
            <DashboardEmptyState />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {designs.map((design) => (
                <DesignPreviewCard
                  key={design.id}
                  id={design.id}
                  name={design.name}
                  balconyWidthCm={design.balconyWidthCm}
                  balconyHeightCm={design.balconyHeightCm}
                  updatedAt={design.updatedAt}
                  isPaid={design.isPaid}
                  thumbnailUrl={design.thumbnailUrl}
                  layoutData={design.layoutData}
                  onDelete={() => handleDelete(design.id, design.name)}
                  className="h-full"
                />
              ))}
            </div>
          )}
        </PageStack>
      </AppPage>
    </AppLayout>
  );
}
