"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const DesignerContent = dynamic(
  () =>
    import("@/components/designer/DesignerContent").then((mod) => ({
      default: mod.DesignerContent,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading designer…
      </div>
    ),
  }
);

export default function DesignerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-background text-sm text-muted-foreground">
          Loading designer…
        </div>
      }
    >
      <DesignerContent />
    </Suspense>
  );
}
