"use client";

import { Suspense, use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppLayout, AppPage, LoadingState, PageStack } from "@/components/layout";
import {
  DesignUnlockPanel,
  DesignUnlockedPanel,
} from "@/components/designs/design-unlock-panel";

interface Design {
  id: string;
  name: string;
  balconyWidthCm: number;
  balconyHeightCm: number;
  isPaid: boolean;
  layoutData: string;
  thumbnailUrl: string | null;
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
    async function loadData() {
      const designRes = await fetch(`/api/designs/${id}`);
      if (designRes.ok) {
        setDesign(await designRes.json());
      }
      setLoading(false);
    }

    loadData();
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
            <DesignUnlockedPanel designId={design.id} name={design.name} />
          ) : (
            <DesignUnlockPanel
              designId={design.id}
              name={design.name}
              balconyWidthCm={design.balconyWidthCm}
              balconyHeightCm={design.balconyHeightCm}
              layoutData={design.layoutData}
              thumbnailUrl={design.thumbnailUrl}
              freeUnlockAllowed={freeUnlockAllowed}
              canceled={canceled}
              onUnlocked={() => router.push(`/designs/${design.id}/links`)}
            />
          )}
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
