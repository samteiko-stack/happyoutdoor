"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CategoryBadge } from "@/components/ui/category-badge";
import { toast } from "sonner";
import { ArrowUp, ArrowDown } from "lucide-react";
import { PageStack } from "@/components/layout";
import {
  DataTableCard,
  RowActions,
  TableRowDefault,
  TableCellActions,
  useTablePagination,
  useTableSelection,
  ProductThumbnail,
} from "@/components/admin";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  categoryId: string | null;
  category: Category | null;
  description: string | null;
  price: number;
  affiliateLink: string | null;
  imageUrl: string | null;
  topViewImageUrl: string | null;
  modelUrl: string | null;
  widthCm: number;
  heightCm: number;
}

const emptyProduct = {
  name: "",
  categoryId: "",
  description: "",
  price: 0,
  affiliateLink: "",
  imageUrl: "",
  topViewImageUrl: "",
  modelUrl: "",
  widthCm: 50,
  heightCm: 50,
};

export function ProductsPageClient({
  initialProducts,
  initialCategories,
}: {
  initialProducts: Product[];
  initialCategories: Category[];
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyProduct);
  const [loading, setLoading] = useState(false);
  const [uploadingModel, setUploadingModel] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Filtering and sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "price" | "category">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const fetchProducts = useCallback(async () => {
    const res = await fetch("/api/admin/products");
    if (res.ok) {
      setProducts(await res.json());
    } else {
      const err = await res.json().catch(() => ({}));
      console.error("Failed to fetch products:", res.status, err);
      toast.error(`Failed to load products: ${err.error || res.status}`);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    const res = await fetch("/api/admin/categories");
    if (res.ok) {
      const data = await res.json();
      setCategories(data);
    } else {
      const err = await res.json().catch(() => ({}));
      console.error("Failed to fetch categories:", res.status, err);
    }
  }, []);

  // Filtered and sorted products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filterCategory !== "all") {
      filtered = filtered.filter((p) => p.categoryId === filterCategory);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === "price") {
        comparison = a.price - b.price;
      } else if (sortBy === "category") {
        const aName = a.category?.name || "Uncategorized";
        const bName = b.category?.name || "Uncategorized";
        comparison = aName.localeCompare(bName);
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [products, searchQuery, filterCategory, sortBy, sortOrder]);

  const pagination = useTablePagination(filteredAndSortedProducts);
  const pageIds = useMemo(
    () => pagination.pagedItems.map((p) => p.id),
    [pagination.pagedItems]
  );
  const selection = useTableSelection(pageIds);

  function openCreate() {
    setEditing(null);
    setForm(emptyProduct);
    setDialogOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product.id);
    setForm({
      name: product.name,
      categoryId: product.categoryId || "",
      description: product.description || "",
      price: product.price,
      affiliateLink: product.affiliateLink || "",
      imageUrl: product.imageUrl || "",
      topViewImageUrl: product.topViewImageUrl || "",
      modelUrl: product.modelUrl || "",
      widthCm: product.widthCm,
      heightCm: product.heightCm,
    });
    setDialogOpen(true);
  }

  async function uploadModelFile(file: File) {
    // Validate file type
    const validExtensions = ['.glb', '.gltf', '.fbx', '.obj'];
    const isValid = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!isValid) {
      toast.error("Supported formats: GLB, GLTF, FBX, OBJ");
      return;
    }

    setUploadingModel(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload-model", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setForm({ ...form, modelUrl: data.url });
        toast.success("3D model uploaded successfully");
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to upload model");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload model");
    } finally {
      setUploadingModel(false);
    }
  }

  async function handleModelUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadModelFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadModelFile(file);
    }
  }

  async function handleSave() {
    setLoading(true);
    try {
      const url = editing
        ? `/api/admin/products/${editing}`
        : "/api/admin/products";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          widthCm: Number(form.widthCm),
          heightCm: Number(form.heightCm),
        }),
      });
      if (res.ok) {
        toast.success(editing ? "Product updated" : "Product created");
        setDialogOpen(false);
        fetchProducts();
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
    if (!confirm("Are you sure you want to delete this product?")) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Product deleted");
      fetchProducts();
    } else {
      toast.error("Failed to delete product");
    }
  }

  async function handleBulkDelete() {
    if (!confirm(`Delete ${selection.selectedCount} products?`)) return;
    const results = await Promise.all(
      selection.selectedIds.map((id) =>
        fetch(`/api/admin/products/${id}`, { method: "DELETE" })
      )
    );
    if (results.every((r) => r.ok)) {
      toast.success(`${selection.selectedCount} products deleted`);
      selection.clear();
      fetchProducts();
    } else {
      toast.error("Some products could not be deleted");
      fetchProducts();
    }
  }

  return (
    <PageStack>
      <DataTableCard
        columns={["Name", "Category", "Price", "Size", "3D model", "Affiliate", ""]}
        isEmpty={filteredAndSortedProducts.length === 0}
        emptyMessage={
          searchQuery || filterCategory !== "all"
            ? "No products match your filters"
            : "No products yet"
        }
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search products…"
        selection={selection}
        onBulkDelete={handleBulkDelete}
        primaryAction={<Button onClick={openCreate}>Add product</Button>}
        filters={
          <>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as "name" | "price" | "category")}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="category">Category</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              title={sortOrder === "asc" ? "Ascending" : "Descending"}
            >
              {sortOrder === "asc" ? <ArrowUp width={16} height={16} /> : <ArrowDown width={16} height={16} />}
            </Button>
          </>
        }
        footer={{
          total: pagination.total,
          page: pagination.page,
          pageSize: pagination.pageSize,
          onPageChange: pagination.setPage,
          onPageSizeChange: pagination.setPageSize,
        }}
      >
        {pagination.pagedItems.map((product) => (
          <TableRowDefault
            key={product.id}
            rowId={product.id}
            selected={selection.isSelected(product.id)}
            onSelect={() => selection.toggle(product.id)}
          >
            <TableCell>
              <div className="flex min-w-0 items-center gap-3">
                <ProductThumbnail
                  name={product.name}
                  imageUrl={product.imageUrl}
                  topViewImageUrl={product.topViewImageUrl}
                />
                <span className="truncate font-medium text-foreground">{product.name}</span>
              </div>
            </TableCell>
            <TableCell>
              {product.category ? (
                <CategoryBadge
                  name={product.category.name}
                  slug={product.category.slug}
                />
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell className="tabular-nums">${product.price.toFixed(2)}</TableCell>
            <TableCell className="text-muted-foreground">
              {product.widthCm} × {product.heightCm}
            </TableCell>
            <TableCell>
              {product.modelUrl ? (
                <Badge variant="secondary">Yes</Badge>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell>
              {product.affiliateLink ? (
                <Badge variant="secondary">Set</Badge>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCellActions>
              <RowActions
                items={[
                  { label: "Edit", icon: "edit", onClick: () => openEdit(product) },
                  {
                    label: "Delete",
                    icon: "delete",
                    destructive: true,
                    onClick: () => handleDelete(product.id),
                  },
                ]}
              />
            </TableCellActions>
          </TableRowDefault>
        ))}
      </DataTableCard>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Product" : "Add New Product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.categoryId || "none"} onValueChange={(v) => setForm({ ...form, categoryId: v === "none" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Uncategorized</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Product description" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Price ($)</Label>
                <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Width (cm)</Label>
                <Input type="number" value={form.widthCm} onChange={(e) => setForm({ ...form, widthCm: parseInt(e.target.value) || 50 })} />
              </div>
              <div className="space-y-2">
                <Label>Height (cm)</Label>
                <Input type="number" value={form.heightCm} onChange={(e) => setForm({ ...form, heightCm: parseInt(e.target.value) || 50 })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Affiliate Link</Label>
              <Input value={form.affiliateLink} onChange={(e) => setForm({ ...form, affiliateLink: e.target.value })} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Top View Image URL</Label>
              <Input value={form.topViewImageUrl} onChange={(e) => setForm({ ...form, topViewImageUrl: e.target.value })} placeholder="https://... (used on canvas)" />
            </div>
            <div className="space-y-2">
              <Label>3D Model (GLB, GLTF, FBX, OBJ)</Label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => {
                  if (!uploadingModel) {
                    document.getElementById('model-file-input')?.click();
                  }
                }}
                className={`relative border-2 border-dashed rounded p-6 transition-colors cursor-pointer ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border bg-muted/20 hover:bg-muted/30"
                } ${uploadingModel ? "opacity-50 pointer-events-none" : ""}`}
              >
                <div className="flex flex-col items-center gap-3 text-center pointer-events-none">
                  <div className="flex h-12 w-12 items-center justify-center rounded bg-muted text-foreground">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {uploadingModel ? "Uploading..." : "Drag & drop your 3D model here"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Supports: GLB, GLTF, FBX, OBJ
                    </p>
                  </div>
                </div>
                <input
                  id="model-file-input"
                  type="file"
                  accept=".glb,.gltf,.fbx,.obj"
                  onChange={handleModelUpload}
                  disabled={uploadingModel}
                  className="hidden"
                />
              </div>
              {form.modelUrl && (
                <div className="flex items-center justify-between gap-2 rounded border border-border bg-muted p-3">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-border bg-background">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-accent"
                      >
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                        <line x1="12" y1="22.08" x2="12" y2="12" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">3D Model Uploaded</p>
                      <p 
                        className="text-xs text-muted-foreground truncate max-w-[300px]" 
                        title={form.modelUrl.split('/').pop()}
                      >
                        {form.modelUrl.split('/').pop()}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setForm({ ...form, modelUrl: "" })}
                    className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 flex-shrink-0"
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={loading || !form.name}>
              {loading ? "Saving..." : editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageStack>
  );
}
