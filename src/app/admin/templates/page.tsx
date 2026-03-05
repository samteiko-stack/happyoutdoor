"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { DesignPencil } from "iconoir-react";

interface Template {
  id: string;
  name: string;
  description: string | null;
  balconyWidthCm: number;
  balconyHeightCm: number;
  layoutData: string;
  isPublished: boolean;
  createdAt: string;
  _count: { designs: number };
}

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
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

  const fetchTemplates = useCallback(async () => {
    const res = await fetch("/api/admin/templates");
    if (res.ok) setTemplates(await res.json());
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  function openCreate() {
    setEditing(null);
    setForm({ name: "", description: "", balconyWidthCm: 300, balconyHeightCm: 200, isPublished: false });
    setDialogOpen(true);
  }

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
        console.error("Save error:", error);
        toast.error(error.error || "Failed to save");
      }
    } catch (error: any) {
      console.error("Save exception:", error);
      toast.error(error.message || "Something went wrong");
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
    try { return JSON.parse(layoutData).length; } catch { return 0; }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Templates</h1>
          <p className="text-muted-foreground">Pre-made balcony designs that users can start from</p>
        </div>
        <Button onClick={openCreate} className="bg-primary hover:bg-primary/90">
          + Add Template
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Templates ({templates.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Used By</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{template.name}</p>
                      {template.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{template.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{template.balconyWidthCm} x {template.balconyHeightCm} cm</TableCell>
                  <TableCell>{getItemCount(template.layoutData)} items</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{template._count.designs} designs</Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={template.isPublished}
                      onCheckedChange={() => handleTogglePublish(template)}
                    />
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link href={`/designer?template=${template.id}`}>
                      <Button variant="outline" size="sm" className="gap-1">
                        <DesignPencil width={14} height={14} />
                        Open
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => openEdit(template)}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(template.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Template" : "Create Template"}</DialogTitle>
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
              <Label>Published (visible to users)</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Tip: To add products to a template, create the template first, then use the Designer to arrange products, save as a design, and copy the layout data.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={loading || !form.name} className="bg-[#6b7f3b] hover:bg-[#5a6b32]">
              {loading ? "Saving..." : editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
