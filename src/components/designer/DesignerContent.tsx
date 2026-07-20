"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useSession } from "@/components/providers/SupabaseProvider";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useDesignerStore } from "@/lib/designer-store";
import { ProductCatalog } from "@/components/designer/ProductCatalog";
import { ToolBar } from "@/components/designer/ToolBar";
import { DesignerHeader } from "@/components/designer/DesignerHeader";
import { DesignerLeaveDialog } from "@/components/designer/DesignerLeaveDialog";
import { ScreenSizeWarning } from "@/components/designer/ScreenSizeWarning";
import { createDesignSnapshot, isDesignDirty } from "@/lib/designer-snapshot";
import { isAdmin } from "@/lib/auth-types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const Canvas = dynamic(
  () => import("@/components/designer/Canvas").then((mod) => ({ default: mod.Canvas })),
  { ssr: false, loading: () => <div className="flex flex-1 items-center justify-center bg-designer-canvas-bg">Loading canvas...</div> }
);

const IsometricScene = dynamic(
  () => import("@/components/designer/IsometricScene").then((mod) => ({ default: mod.IsometricScene })),
  { ssr: false, loading: () => <div className="flex flex-1 items-center justify-center bg-designer-canvas-bg">Loading 3D...</div> }
);

const BACK_NAV = "__back__";

export function DesignerContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [saving, setSaving] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [cleanVersion, setCleanVersion] = useState(0);
  const snapshotFnRef = useRef<(() => string) | null>(null);
  const baselineRef = useRef("");
  const pendingNavRef = useRef<string | null>(null);

  const handleSnapshotReady = useCallback((fn: () => string) => {
    snapshotFnRef.current = fn;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const exposeSnapshot = () => {
      (
        window as Window & { __designerSnapshot?: () => string | null }
      ).__designerSnapshot = () => snapshotFnRef.current?.() ?? null;
    };

    exposeSnapshot();
    return () => {
      delete (window as Window & { __designerSnapshot?: () => string | null })
        .__designerSnapshot;
    };
  }, [isReady]);

  async function captureAndUploadSnapshot(): Promise<string | null> {
    const store = useDesignerStore.getState();
    const previousView = store.viewMode;
    const previousSelection = store.selectedItemId;

    store.setSelectedItemId(null);
    if (previousView !== "perspective") {
      store.setViewMode("perspective");
      await new Promise((resolve) => setTimeout(resolve, 400));
    }

    const deadline = Date.now() + 8000;
    while (!snapshotFnRef.current && Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (!snapshotFnRef.current) return null;

    try {
      for (let attempt = 0; attempt < 5; attempt += 1) {
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
          );
        });

        const dataUrl = snapshotFnRef.current();
        if (!dataUrl.startsWith("data:image/")) continue;

        const blob = await fetch(dataUrl).then((r) => r.blob());
        if (blob.size < 256) continue;

        const file = new File([blob], `snapshot-${Date.now()}.jpg`, { type: "image/jpeg" });
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload-snapshot", { method: "POST", body: formData });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          console.error("Snapshot upload failed:", body?.error ?? res.status);
          continue;
        }

        const { url } = await res.json();
        if (typeof url === "string" && url.length > 0) return url;
      }
    } catch (e) {
      console.error("Snapshot upload failed:", e);
    } finally {
      if (previousView !== "perspective") {
        store.setViewMode(previousView);
      }
      if (previousSelection) {
        store.setSelectedItemId(previousSelection);
      }
    }
    return null;
  }

  const {
    setProducts,
    setCategories,
    items,
    setItems,
    designId,
    setDesignId,
    designName,
    setDesignName,
    setSourceTemplateId,
    balconyWidthCm,
    balconyHeightCm,
    setBalconySize,
    viewMode,
    setViewMode,
  } = useDesignerStore();

  const markClean = useCallback(() => {
    const state = useDesignerStore.getState();
    baselineRef.current = createDesignSnapshot({
      designName: state.designName,
      balconyWidthCm: state.balconyWidthCm,
      balconyHeightCm: state.balconyHeightCm,
      items: state.items,
    });
    setCleanVersion((version) => version + 1);
  }, []);

  const isDirty = useMemo(() => {
    if (!isReady) return false;
    return isDesignDirty(
      { designName, balconyWidthCm, balconyHeightCm, items },
      baselineRef.current
    );
  }, [isReady, designName, balconyWidthCm, balconyHeightCm, items, cleanVersion]);

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

  const designParam = searchParams.get("id") ?? "";
  const templateParam = searchParams.get("template") ?? "";
  const widthParam = searchParams.get("w") ?? "";
  const heightParam = searchParams.get("h") ?? "";

  useEffect(() => {
    let cancelled = false;

    async function loadDesign() {
      setIsReady(false);
      setItems([]);
      setDesignId(null);
      setIsPaid(false);
      setSourceTemplateId(null);
      setDesignName("My Balcony Design");

      const parsedWidth = Number(widthParam);
      const parsedHeight = Number(heightParam);
      const starterWidth =
        Number.isFinite(parsedWidth) && parsedWidth >= 150 && parsedWidth <= 600
          ? parsedWidth
          : 300;
      const starterHeight =
        Number.isFinite(parsedHeight) && parsedHeight >= 100 && parsedHeight <= 400
          ? parsedHeight
          : 200;
      setBalconySize(starterWidth, starterHeight);

      try {
        if (designParam) {
          const res = await fetch(`/api/designs/${designParam}`);
          const design = await res.json();
          if (cancelled) return;
          if (design.id) {
            setDesignId(design.id);
            setIsPaid(Boolean(design.isPaid));
            setSourceTemplateId(design.templateId ?? null);
            setDesignName(design.name);
            setBalconySize(design.balconyWidthCm, design.balconyHeightCm);
            setItems(JSON.parse(design.layoutData || "[]"));
          } else {
            toast.error(`Could not load design: ${design.error || "unknown error"}`);
          }
        } else if (templateParam) {
          const res = await fetch(`/api/templates/${templateParam}`);
          const template = await res.json();
          if (cancelled) return;
          if (template?.id) {
            setSourceTemplateId(template.id);
            const isTemplateAdmin = session?.user && isAdmin(session.user);
            setDesignName(isTemplateAdmin ? template.name : `${template.name} - My Design`);
            setBalconySize(template.balconyWidthCm, template.balconyHeightCm);
            const layoutItems = JSON.parse(template.layoutData || "[]");
            setItems(
              layoutItems.map((item: Record<string, unknown>) => ({
                ...item,
                id: crypto.randomUUID(),
              }))
            );
          }
        }
      } catch {
        if (!cancelled) toast.error("Could not load design");
      }

      if (!cancelled) {
        markClean();
        setIsReady(true);
      }
    }

    loadDesign();
    return () => {
      cancelled = true;
    };
  }, [
    designParam,
    templateParam,
    widthParam,
    heightParam,
    setItems,
    setDesignId,
    setSourceTemplateId,
    setDesignName,
    setBalconySize,
    markClean,
    session?.user,
  ]);

  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty) return;
    window.history.pushState(null, "", window.location.href);
    const onPopState = () => {
      window.history.pushState(null, "", window.location.href);
      pendingNavRef.current = BACK_NAV;
      setLeaveOpen(true);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [isDirty]);

  const performNavigation = useCallback(
    (target: string) => {
      pendingNavRef.current = null;
      setLeaveOpen(false);
      if (target === BACK_NAV) {
        router.back();
      } else {
        router.push(target);
      }
    },
    [router]
  );

  const requestNavigation = useCallback(
    (href: string) => {
      if (!isDirty) {
        router.push(href);
        return;
      }
      pendingNavRef.current = href;
      setLeaveOpen(true);
    },
    [isDirty, router]
  );

  const handleSave = useCallback(async (): Promise<boolean> => {
    if (!session) {
      router.push("/login");
      return false;
    }

    setSaving(true);
    try {
      const layoutData = JSON.stringify(items);
      const thumbnailUrl = await captureAndUploadSnapshot();
      const sourceTemplateId =
        useDesignerStore.getState().sourceTemplateId ?? searchParams.get("template");
      const editingTemplate = Boolean(
        sourceTemplateId && isAdmin(session.user) && !designId
      );

      if (editingTemplate && sourceTemplateId) {
        const res = await fetch(`/api/admin/templates/${sourceTemplateId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: designName,
            balconyWidthCm,
            balconyHeightCm,
            layoutData,
            ...(thumbnailUrl && { thumbnailUrl }),
          }),
        });
        if (res.ok) {
          toast.success("Template saved");
          if (!thumbnailUrl) toast.error("Preview could not be saved");
          markClean();
          return true;
        }
        toast.error("Failed to save template");
        return false;
      }

      if (designId) {
        const res = await fetch(`/api/designs/${designId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: designName,
            balconyWidthCm,
            balconyHeightCm,
            layoutData,
            ...(thumbnailUrl && { thumbnailUrl }),
          }),
        });
        if (res.ok) {
          toast.success("Design saved");
          if (!thumbnailUrl) toast.error("Preview could not be saved");
          markClean();
          return true;
        }
        toast.error("Failed to save design");
        return false;
      }

      const res = await fetch("/api/designs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: designName,
          balconyWidthCm,
          balconyHeightCm,
          layoutData,
          ...(sourceTemplateId && { templateId: sourceTemplateId }),
          ...(thumbnailUrl && { thumbnailUrl }),
        }),
      });
      if (res.ok) {
        const design = await res.json();
        setDesignId(design.id);
        setIsPaid(Boolean(design.isPaid));
        setSourceTemplateId(design.templateId ?? sourceTemplateId ?? null);
        window.history.replaceState(null, "", `/designer?id=${design.id}`);
        toast.success("Design created");
        if (!thumbnailUrl) toast.error("Preview could not be saved");
        markClean();
        return true;
      }
      toast.error("Failed to create design");
      return false;
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Something went wrong");
      return false;
    } finally {
      setSaving(false);
    }
  }, [
    session,
    router,
    items,
    searchParams,
    designId,
    designName,
    balconyWidthCm,
    balconyHeightCm,
    setDesignId,
    markClean,
  ]);

  async function handleLeaveSave() {
    const saved = await handleSave();
    if (saved && pendingNavRef.current) {
      performNavigation(pendingNavRef.current);
    }
  }

  function handleLeaveDiscard() {
    if (pendingNavRef.current) {
      performNavigation(pendingNavRef.current);
    } else {
      setLeaveOpen(false);
    }
  }

  const isAdminUser = session?.user ? isAdmin(session.user) : false;
  const saveLabel =
    searchParams.get("template") && isAdminUser && !designId ? "Save template" : "Save";

  return (
    <div className="designer-shell">
      <ScreenSizeWarning />

      <DesignerHeader
        designName={designName}
        designId={designId}
        isPaid={isPaid}
        onDesignNameChange={setDesignName}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onSave={() => void handleSave()}
        saving={saving}
        isAdmin={isAdminUser}
        saveLabel={saveLabel}
        isDirty={isDirty}
        onNavigate={requestNavigation}
      />

      <ToolBar />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="designer-stage min-w-0 flex-1">
          <div className="designer-viewport relative">
            <div
              className={cn(
                "absolute inset-0",
                viewMode === "topView" && "pointer-events-none invisible"
              )}
              aria-hidden={viewMode === "topView"}
            >
              <IsometricScene
                onSnapshotReady={handleSnapshotReady}
                frameloop={viewMode === "perspective" ? "always" : "demand"}
              />
            </div>
            {viewMode === "topView" ? (
              <div className="absolute inset-0">
                <Canvas />
              </div>
            ) : null}
          </div>
        </div>
        <ProductCatalog />
      </div>

      <DesignerLeaveDialog
        open={leaveOpen}
        saving={saving}
        onStay={() => {
          pendingNavRef.current = null;
          setLeaveOpen(false);
        }}
        onDiscard={handleLeaveDiscard}
        onSave={() => void handleLeaveSave()}
      />
    </div>
  );
}
