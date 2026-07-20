import { Suspense } from "react";
import { getAdminTemplates } from "@/lib/admin/queries.server";
import { TemplatesPageClient } from "./templates-page-client";

export default async function AdminTemplatesPage() {
  const templates = await getAdminTemplates();
  return (
    <Suspense fallback={null}>
      <TemplatesPageClient initialTemplates={templates} />
    </Suspense>
  );
}
