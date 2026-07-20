import { createAdminClient } from "@/lib/supabase/admin";
import { mapDesign, mapTemplate } from "@/lib/mappers";
import { getFirstName, getGreeting } from "@/lib/dashboard-greeting";
import { requireCustomerUser } from "@/lib/require-workspace";
import { AppLayout, AppPage, PageStack } from "@/components/layout";
import { DashboardBanner } from "@/components/dashboard/dashboard-banner";
import { DashboardStarters } from "@/components/dashboard/dashboard-starters";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { ScrollRail } from "@/components/ui/scroll-rail";
import { DesignPreviewCard } from "@/components/dashboard/design-preview-card";
import { TemplateCard } from "@/components/dashboard/template-card";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireCustomerUser();

  let designs: ReturnType<typeof mapDesign>[] = [];
  let templates: ReturnType<typeof mapTemplate>[] = [];

  try {
    const admin = createAdminClient();

    const { data: designRows } = await admin
      .from("designs")
      .select("*")
      .eq("user_id", session.user.id)
      .order("updated_at", { ascending: false })
      .limit(24);

    designs = (designRows ?? []).map((row) => mapDesign(row));

    const { data: templateRows } = await admin
      .from("templates")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(8);

    templates = (templateRows ?? []).map(mapTemplate);
  } catch (error) {
    console.error("Dashboard data error:", error);
  }

  const firstName = getFirstName(session.user.name, session.user.email);
  const hasDesigns = designs.length > 0;
  const listedDesigns = designs.slice(0, 9);

  return (
    <AppLayout>
      <AppPage>
        <PageStack>
          <DashboardBanner
            greeting={getGreeting()}
            name={firstName}
            hasDesigns={hasDesigns}
          />

          {hasDesigns && (
            <DashboardContinue
              id={designs[0].id}
              name={designs[0].name}
              balconyWidthCm={designs[0].balconyWidthCm}
              balconyHeightCm={designs[0].balconyHeightCm}
              updatedAt={designs[0].updatedAt}
              isPaid={designs[0].isPaid}
              thumbnailUrl={designs[0].thumbnailUrl}
              itemCount={getDesignProductSummary(designs[0].layoutData).itemCount}
            />
          )}

          {hasDesigns && (
            <DashboardSection title="Designs" href="/designs">
              <ScrollRail visibleCount={5} bleed={false}>
                {listedDesigns.map((design, index) => (
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
                    featured={index === 0}
                    className="h-full"
                  />
                ))}
              </ScrollRail>
            </DashboardSection>
          )}

          <DashboardSection title="Start with a template">
            {templates.length > 0 ? (
              <ScrollRail visibleCount={5} bleed={false}>
                {templates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    id={template.id}
                    name={template.name}
                    balconyWidthCm={template.balconyWidthCm}
                    balconyHeightCm={template.balconyHeightCm}
                    thumbnailUrl={template.thumbnailUrl}
                    className="h-full"
                  />
                ))}
              </ScrollRail>
            ) : (
              <p className="text-sm text-muted-foreground">No templates yet.</p>
            )}
          </DashboardSection>

          <DashboardSection title="Start with a size">
            <DashboardStarters />
          </DashboardSection>
        </PageStack>
      </AppPage>
    </AppLayout>
  );
}
