"use client";

import { Suspense, use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppLayout, AppPage, LoadingState, PageStack } from "@/components/layout";
import {
  DesignUnlockActions,
  DesignUnlockCheckout,
  DesignUnlockPreview,
  DesignUnlockedCard,
} from "@/components/designs/design-unlock-panel";

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

function DesignUnlockContent({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [design, setDesign] = useState<Design | null>(null);
  const [loading, setLoading] = useState(true);
  const canceled = searchParams.get("canceled") === "true";
  const freeUnlockAllowed =
    process.env.NODE_ENV !== "production" ||
    process.env.NEXT_PUBLIC_ALLOW_FREE_UNLOCK === "true";

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setDesign(null);

    async function loadData() {
      try {
        const designRes = await fetch(`/api/designs/${id}`, { cache: "no-store" });
        if (cancelled) return;

        if (designRes.ok) {
          setDesign(await designRes.json());
        } else {
          setDesign(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <AppLayout>
        <AppPage>
          <LoadingState message="Loading design…" />
        </AppPage>
      </AppLayout>
    );
  }

  if (!design) {
    return (
      <AppLayout>
        <AppPage>
          <LoadingState message="Design not found" />
        </AppPage>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <AppPage>
        <PageStack>
          {design.isPaid ? (
            <DesignUnlockedCard designId={design.id} name={design.name} />
          ) : (
            <DesignUnlockPreview
              name={design.name}
              balconyWidthCm={design.balconyWidthCm}
              balconyHeightCm={design.balconyHeightCm}
              layoutData={design.layoutData}
              thumbnailUrl={design.thumbnailUrl}
              updatedAt={design.updatedAt}
            />
          )}

          {!design.isPaid && (
            <DesignUnlockCheckout
              designId={design.id}
              layoutData={design.layoutData}
              freeUnlockAllowed={freeUnlockAllowed}
              canceled={canceled}
              onUnlocked={() => router.push(`/designs/${design.id}/links`)}
            />
          )}

          <DesignUnlockActions designId={design.id} showEdit={!design.isPaid} />
        </PageStack>
      </AppPage>
    </AppLayout>
  );
}

export default function DesignUnlockPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <Suspense
      fallback={
        <AppLayout>
          <AppPage>
            <LoadingState message="Loading design…" />
          </AppPage>
        </AppLayout>
      }
    >
      <DesignUnlockContent id={id} />
    </Suspense>
  );
}
