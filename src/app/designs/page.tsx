"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AppLayout, AppPage, LoadingState } from "@/components/layout";
import { DesignPreviewCard } from "@/components/dashboard/design-preview-card";
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";
import { ScrollRail } from "@/components/ui/scroll-rail";

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
    const res = await fetch("/api/designs");
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
        {meta && <p className="mb-4 text-sm text-muted-foreground">{meta}</p>}

        {designs.length === 0 ? (
          <DashboardEmptyState />
        ) : (
          <ScrollRail itemWidth={248} bleed={false}>
            {designs.map((design) => (
              <div key={design.id} className="group space-y-2">
                <DesignPreviewCard
                  id={design.id}
                  name={design.name}
                  balconyWidthCm={design.balconyWidthCm}
                  balconyHeightCm={design.balconyHeightCm}
                  updatedAt={design.updatedAt}
                  isPaid={design.isPaid}
                  thumbnailUrl={design.thumbnailUrl}
                  layoutData={design.layoutData}
                  className="h-full"
                />
                <div className="flex items-center gap-3 px-1 opacity-100 md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
                  {design.isPaid ? (
                    <Link
                      href={`/designs/${design.id}/links`}
                      className="text-xs font-medium text-primary hover:text-brand-moss-dark"
                    >
                      Links
                    </Link>
                  ) : (
                    <Link
                      href={`/designs/${design.id}`}
                      className="text-xs font-medium text-primary hover:text-brand-moss-dark"
                    >
                      Unlock
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(design.id, design.name)}
                    className="text-xs font-medium text-muted-foreground hover:text-destructive"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </ScrollRail>
        )}
      </AppPage>
    </AppLayout>
  );
}
