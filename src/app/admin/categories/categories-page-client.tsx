"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { TableCell } from "@/components/ui/table";
import { toast } from "sonner";
import { PageStack } from "@/components/layout";
import {
  DataTableCard,
  RowActions,
  TableRowDefault,
  TableCellActions,
  useTablePagination,
  useTableSelection,
} from "@/components/admin";
import { useConfirmDialog } from "@/components/ui/use-confirm-dialog";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  sortOrder: number;
  _count: { products: number };
}

interface CategoriesPageClientProps {
  initialCategories: Category[];
}

export function CategoriesPageClient({ initialCategories }: CategoriesPageClientProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", icon: "", sortOrder: 0 });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const fetchCategories = useCallback(async () => {
    const res = await fetch("/api/admin/categories");
    if (res.ok) setCategories(await res.json());
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q)
    );
  }, [categories, searchQuery]);

  const pagination = useTablePagination(filtered);
  const pageIds = useMemo(
    () => pagination.pagedItems.map((c) => c.id),
    [pagination.pagedItems]
  );
  const selection = useTableSelection(pageIds);

  function openCreate() {
    setEditing(null);
    setForm({ name: "", slug: "", icon: "", sortOrder: categories.length + 1 });
    setDialogOpen(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat.id);
    setForm({
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon || "",
      sortOrder: cat.sortOrder,
    });
    setDialogOpen(true);
  }

  function generateSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  async function handleSave() {
    setLoading(true);
    try {
      const slug = form.slug || generateSlug(form.name);
      const url = editing ? `/api/admin/categories/${editing}` : "/api/admin/categories";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, slug, sortOrder: Number(form.sortOrder) }),
      });
      if (res.ok) {
        toast.success(editing ? "Category updated" : "Category created");
        setDialogOpen(false);
        fetchCategories();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save");
      }
    } catch {
      toast.error("Something went wrong");
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    const confirmed = await confirm({
      title: "Delete category?",
      description: "All products in this category will also be deleted.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!confirmed) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Category deleted");
      fetchCategories();
    } else {
      toast.error("Failed to delete category");
    }
  }

  async function handleBulkDelete() {
    const confirmed = await confirm({
      title: `Delete ${selection.selectedCount} categories?`,
      description: "Products in these categories will also be deleted.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!confirmed) return;
    const results = await Promise.all(
      selection.selectedIds.map((id) =>
        fetch(`/api/admin/categories/${id}`, { method: "DELETE" })
      )
    );
    if (results.every((r) => r.ok)) {
      toast.success(`${selection.selectedCount} categories deleted`);
      selection.clear();
      fetchCategories();
    } else {
      toast.error("Some categories could not be deleted");
      fetchCategories();
    }
  }

  return (
    <PageStack>
      <DataTableCard
        columns={["Order", "Icon", "Name", "Slug", "Products", ""]}
        isEmpty={filtered.length === 0}
        emptyMessage={searchQuery ? "No categories match your search" : "No categories yet"}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search categories…"
        selection={selection}
        onBulkDelete={handleBulkDelete}
        primaryAction={<Button onClick={openCreate}>Add category</Button>}
        footer={{
          total: pagination.total,
          page: pagination.page,
          pageSize: pagination.pageSize,
          onPageChange: pagination.setPage,
          onPageSizeChange: pagination.setPageSize,
        }}
      >
        {pagination.pagedItems.map((cat) => (
          <TableRowDefault
            key={cat.id}
            rowId={cat.id}
            selected={selection.isSelected(cat.id)}
            onSelect={() => selection.toggle(cat.id)}
          >
            <TableCell className="tabular-nums text-muted-foreground">{cat.sortOrder}</TableCell>
            <TableCell>{cat.icon || "—"}</TableCell>
            <TableCell className="font-medium text-foreground">{cat.name}</TableCell>
            <TableCell className="text-muted-foreground">{cat.slug}</TableCell>
            <TableCell>
              <Badge variant="secondary">{cat._count.products}</Badge>
            </TableCell>
            <TableCellActions>
              <RowActions
                items={[
                  { label: "Edit", icon: "edit", onClick: () => openEdit(cat) },
                  {
                    label: "Delete",
                    icon: "delete",
                    destructive: true,
                    onClick: () => handleDelete(cat.id),
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
            <DialogTitle>{editing ? "Edit category" : "Add category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm({ ...form, name, slug: editing ? form.slug : generateSlug(name) });
                }}
                placeholder="Category name"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Icon</Label>
                <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="e.g. armchair" />
              </div>
              <div className="space-y-2">
                <Label>Sort order</Label>
                <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} />
              </div>
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
      <ConfirmDialog />
    </PageStack>
  );
}
