"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { PageStack } from "@/components/layout";
import { SnapshotThumbnail } from "@/components/dashboard/snapshot-thumbnail";
import {
  DataTableCard,
  RowActions,
  TableRowDefault,
  TableCellActions,
  useTablePagination,
  useTableSelection,
} from "@/components/admin";

interface Template {
  id: string;
  name: string;
  description: string | null;
  thumbnailUrl: string | null;
  balconyWidthCm: number;
  balconyHeightCm: number;
  layoutData: string;
  isPublished: boolean;
  createdAt: string;
  _count: { designs: number };
}

export function TemplatesPageClient({
  initialTemplates,
}: {
  initialTemplates: Template[];
}) {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    balconyWidthCm: 300,
    balconyHeightCm: 200,
    isPublished: false,
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPublished, setFilterPublished] = useState<string>("all");
  const searchParams = useSearchParams();

  const fetchTemplates = useCallback(async () => {
    const res = await fetch("/api/admin/templates");
    if (res.ok) setTemplates(await res.json());
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ name: "", description: "", balconyWidthCm: 300, balconyHeightCm: 200, isPublished: false });
    setDialogOpen(true);
  }

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      openCreate();
    }
  }, [searchParams]);

  function openEdit(template: Template) {
    setEditing(template.id);
    setForm({
      name: template.name,
      description: template.description || "",
      balconyWidthCm: template.balconyWidthCm,
      balconyHeightCm: template.balconyHeightCm,
      isPublished: template.isPublished,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    setLoading(true);
    try {
      const url = editing ? `/api/admin/templates/${editing}` : "/api/admin/templates";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          balconyWidthCm: Number(form.balconyWidthCm),
          balconyHeightCm: Number(form.balconyHeightCm),
        }),
      });
      if (res.ok) {
        toast.success(editing ? "Template updated" : "Template created");
        setDialogOpen(false);
        fetchTemplates();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to save");
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    }
    setLoading(false);
  }

  async function handleTogglePublish(template: Template) {
    const res = await fetch(`/api/admin/templates/${template.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !template.isPublished }),
    });
    if (res.ok) {
      toast.success(template.isPublished ? "Template unpublished" : "Template published");
      fetchTemplates();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this template?")) return;
    const res = await fetch(`/api/admin/templates/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Template deleted");
      fetchTemplates();
    }
  }

  function getItemCount(layoutData: string): number {
    try {
      return JSON.parse(layoutData).length;
    } catch {
      return 0;
    }
  }

  const filtered = useMemo(() => {
    let list = templates;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      );
    }
    if (filterPublished === "published") {
      list = list.filter((t) => t.isPublished);
    } else if (filterPublished === "draft") {
      list = list.filter((t) => !t.isPublished);
    }
    return list;
  }, [templates, searchQuery, filterPublished]);

  const pagination = useTablePagination(filtered);
  const pageIds = useMemo(
    () => pagination.pagedItems.map((t) => t.id),
    [pagination.pagedItems]
  );
  const selection = useTableSelection(pageIds);

  async function handleBulkDelete() {
    if (!confirm(`Delete ${selection.selectedCount} templates?`)) return;
    const results = await Promise.all(
      selection.selectedIds.map((id) =>
        fetch(`/api/admin/templates/${id}`, { method: "DELETE" })
      )
    );
    if (results.every((r) => r.ok)) {
      toast.success(`${selection.selectedCount} templates deleted`);
      selection.clear();
      fetchTemplates();
    } else {
      toast.error("Some templates could not be deleted");
      fetchTemplates();
    }
  }

  return (
    <PageStack>
      <DataTableCard
        columns={["Preview", "Name", "Size", "Items", "Used by", "Published", ""]}
        isEmpty={filtered.length === 0}
        emptyMessage={searchQuery || filterPublished !== "all" ? "No templates match your filters" : "No templates yet"}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search templates…"
        selection={selection}
        onBulkDelete={handleBulkDelete}
        primaryAction={<Button onClick={openCreate}>Add template</Button>}
        filters={
          <Select value={filterPublished} onValueChange={setFilterPublished}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        }
        footer={{
          total: pagination.total,
          page: pagination.page,
          pageSize: pagination.pageSize,
          onPageChange: pagination.setPage,
          onPageSizeChange: pagination.setPageSize,
        }}
      >
        {pagination.pagedItems.map((template) => (
          <TableRowDefault
            key={template.id}
            rowId={template.id}
            selected={selection.isSelected(template.id)}
            onSelect={() => selection.toggle(template.id)}
          >
            <TableCell className="w-[4.5rem]">
              <SnapshotThumbnail
                src={template.thumbnailUrl}
                alt={template.name}
                className="size-12 rounded-lg"
              />
            </TableCell>
            <TableCell>
              <p className="font-medium text-foreground">{template.name}</p>
              {template.description && (
                <p className="mt-0.5 max-w-xs truncate text-sm text-muted-foreground">
                  {template.description}
                </p>
              )}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {template.balconyWidthCm} × {template.balconyHeightCm} cm
            </TableCell>
            <TableCell>{getItemCount(template.layoutData)}</TableCell>
            <TableCell>
              <Badge variant="secondary">{template._count.designs}</Badge>
            </TableCell>
            <TableCell>
              <Switch
                checked={template.isPublished}
                onCheckedChange={() => handleTogglePublish(template)}
              />
            </TableCell>
            <TableCellActions>
              <RowActions
                items={[
                  { label: "Edit", icon: "edit", onClick: () => openEdit(template) },
                  {
                    label: "Edit layout",
                    icon: "open",
                    href: `/designer?template=${template.id}`,
                  },
                  {
                    label: "Delete",
                    icon: "delete",
                    destructive: true,
                    onClick: () => handleDelete(template.id),
                  },
                ]}
              />
            </TableCellActions>
          </TableRowDefault>
        ))}
      </DataTableCard>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit template" : "Create template"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Template name" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Width (cm)</Label>
                <Input type="number" value={form.balconyWidthCm} onChange={(e) => setForm({ ...form, balconyWidthCm: parseInt(e.target.value) || 300 })} />
              </div>
              <div className="space-y-2">
                <Label>Height (cm)</Label>
                <Input type="number" value={form.balconyHeightCm} onChange={(e) => setForm({ ...form, balconyHeightCm: parseInt(e.target.value) || 200 })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isPublished} onCheckedChange={(v) => setForm({ ...form, isPublished: v })} />
              <Label>Published</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={loading || !form.name}>
              {loading ? "Saving…" : editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageStack>
  );
}
