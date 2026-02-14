"use client";

import { Suspense } from "react";
import { DesignerContent } from "@/components/designer/DesignerContent";

export default function DesignerPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading designer...</div>}>
      <DesignerContent />
    </Suspense>
  );
}
