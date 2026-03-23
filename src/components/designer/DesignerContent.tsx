"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useDesignerStore } from "@/lib/designer-store";
import { ProductCatalog } from "@/components/designer/ProductCatalog";
import { ToolBar } from "@/components/designer/ToolBar";
import { ScreenSizeWarning } from "@/components/designer/ScreenSizeWarning";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";
import { UserMenu } from "@/components/UserMenu";
import { EditPencil, FloppyDisk, ViewGrid } from "iconoir-react";

const Canvas = dynamic(
  () => import("@/components/designer/Canvas").then((mod) => ({ default: mod.Canvas })),
  { ssr: false, loading: () => <div className="flex-1 flex items-center justify-center bg-gray-100">Loading canvas...</div> }
);

const IsometricScene = dynamic(
  () => import("@/components/designer/IsometricScene").then((mod) => ({ default: mod.IsometricScene })),
  { ssr: false, loading: () => <div className="flex-1 flex items-center justify-center bg-secondary/20">Loading 3D...</div> }
);

export function DesignerContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [saving, setSaving] = useState(false);
  const [editingName, setEditingName] = useState(false);

  const {
    setProducts,
    setCategories,
    items,
    setItems,
    designId,
    setDesignId,
    designName,
    setDesignName,
    balconyWidthCm,
    balconyHeightCm,
    setBalconySize,
    viewMode,
  } = useDesignerStore();

  // Reset store state on every mount so stale data never bleeds between navigations
  useEffect(() => {
    setItems([]);
    setDesignId(null);
    setDesignName("My Balcony Design");
    setBalconySize(300, 200);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load products and categories
  useEffect(() => {
    async function loadData() {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/categories"),
      ]);
      if (productsRes.ok) setProducts(await productsRes.json());
      if (categoriesRes.ok) setCategories(await categoriesRes.json());
    }
    loadData();
  }, [setProducts, setCategories]);

  // Load existing design if ID is in URL
  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      console.log("🔵 Loading design with ID:", id);
      fetch(`/api/designs/${id}`)
        .then((res) => res.json())
        .then((design) => {
          if (design.id) {
            console.log("✅ Design loaded:", design.id, design.name, "Items:", JSON.parse(design.layoutData || "[]").length);
            setDesignId(design.id);
            setDesignName(design.name);
            setBalconySize(design.balconyWidthCm, design.balconyHeightCm);
            const layoutItems = JSON.parse(design.layoutData || "[]");
            setItems(layoutItems);
          } else {
            console.error("❌ Design response missing ID:", design);
          }
        })
        .catch((err) => {
          console.error("❌ Failed to load design:", err);
        });
    }
  }, [searchParams, setDesignId, setDesignName, setBalconySize, setItems]);

  // Load template if template param is in URL
  useEffect(() => {
    const templateId = searchParams.get("template");
    if (templateId && !searchParams.get("id")) {
      console.log("🟢 Loading template with ID:", templateId);
      fetch(`/api/templates/${templateId}`)
        .then((res) => res.json())
        .then((template) => {
          if (template && template.id) {
            console.log("✅ Template loaded:", template.id, template.name, "Items:", JSON.parse(template.layoutData || "[]").length);
            setDesignName(`${template.name} - My Design`);
            setBalconySize(template.balconyWidthCm, template.balconyHeightCm);
            const layoutItems = JSON.parse(template.layoutData || "[]");
            const itemsWithIds = layoutItems.map((item: Record<string, unknown>) => ({
              ...item,
              id: crypto.randomUUID(),
            }));
            setItems(itemsWithIds);
          } else {
            console.error("❌ Template response missing ID:", template);
          }
        })
        .catch((err) => {
          console.error("❌ Failed to load template:", err);
        });
    }
  }, [searchParams, setDesignName, setBalconySize, setItems]);

  async function handleSave() {
    if (!session) {
      router.push("/login");
      return;
    }

    setSaving(true);
    try {
      const layoutData = JSON.stringify(items);
      
      // Check if we're editing a template (admin only)
      const templateId = searchParams.get("template");
      const isAdmin = session.user?.role?.toLowerCase() === "admin";
      
      if (templateId && isAdmin && !designId) {
        // Update the template
        console.log("💾 Saving template:", templateId, "Items:", items.length);
        const res = await fetch(`/api/admin/templates/${templateId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            balconyWidthCm, 
            balconyHeightCm, 
            layoutData 
          }),
        });
        if (res.ok) {
          console.log("✅ Template saved successfully");
          toast.success("Template saved!");
        } else {
          const error = await res.json();
          console.error("❌ Template save failed:", error);
          toast.error("Failed to save template");
        }
      } else if (designId) {
        // Update existing design
        console.log("💾 Updating design:", designId, "Items:", items.length);
        const res = await fetch(`/api/designs/${designId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: designName, balconyWidthCm, balconyHeightCm, layoutData }),
        });
        if (res.ok) {
          console.log("✅ Design updated successfully");
          toast.success("Design saved!");
        } else {
          const error = await res.json();
          console.error("❌ Design update failed:", error);
          toast.error("Failed to save design");
        }
      } else {
        // Create new design
        console.log("💾 Creating new design:", designName, "Items:", items.length);
        const res = await fetch("/api/designs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: designName, balconyWidthCm, balconyHeightCm, layoutData }),
        });
        if (res.ok) {
          const design = await res.json();
          console.log("✅ Design created:", design.id);
          setDesignId(design.id);
          window.history.replaceState(null, "", `/designer?id=${design.id}`);
          toast.success("Design created!");
        } else {
          const error = await res.json();
          console.error("❌ Design creation failed:", error);
          toast.error("Failed to create design");
        }
      }
    } catch (err) {
      console.error("❌ Save exception:", err);
      toast.error("Something went wrong");
    }
    setSaving(false);
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Screen size warning overlay */}
      <ScreenSizeWarning />
      
      {/* Top bar */}
      <div className="flex items-center justify-between bg-white border-b px-4 py-2 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-primary font-bold text-lg hover:text-primary/80">
            Happy Balcony
          </Link>
          <span className="text-gray-300">|</span>
          {editingName ? (
            <Input
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              onBlur={() => setEditingName(false)}
              onKeyDown={(e) => e.key === "Enter" && setEditingName(false)}
              className="w-60 h-8"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="group flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-muted/50 transition-colors"
            >
              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                {designName}
              </span>
              <EditPencil 
                width={14} 
                height={14} 
                className="text-muted-foreground group-hover:text-primary transition-colors" 
              />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="gap-2">
              <ViewGrid width={16} height={16} />
              Dashboard
            </Button>
          </Link>
          <Button
            onClick={handleSave}
            disabled={saving}
            size="sm"
            className="bg-primary hover:bg-primary/90 min-w-[120px] relative gap-2"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              <>
                <FloppyDisk width={16} height={16} />
                {searchParams.get("template") && session?.user?.role?.toLowerCase() === "admin" && !designId 
                  ? "Save Template" 
                  : "Save Design"}
              </>
            )}
          </Button>
          <UserMenu />
        </div>
      </div>

      {/* Toolbar */}
      <ToolBar />

      {/* Main content: Canvas/Scene + Catalog */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1">
          {viewMode === "topView" ? <Canvas /> : <IsometricScene />}
        </div>
        <div className="w-80 flex-shrink-0">
          <ProductCatalog />
        </div>
      </div>
    </div>
  );
}
