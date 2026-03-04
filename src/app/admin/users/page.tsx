"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { WarningTriangle } from "iconoir-react";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  _count: { designs: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingRoleChange, setPendingRoleChange] = useState<{ userId: string; role: string; userName: string } | null>(null);
  const [confirmAdminGrant, setConfirmAdminGrant] = useState(false);

  const fetchUsers = useCallback(async () => {
    const res = await fetch("/api/admin/users");
    if (res.ok) setUsers(await res.json());
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function handleRoleChange(userId: string, role: string, userName: string) {
    // If changing to admin, show confirmation dialog
    if (role === "ADMIN") {
      setPendingRoleChange({ userId, role, userName });
      setConfirmDialogOpen(true);
      return;
    }

    // For non-admin changes, proceed directly
    await updateRole(userId, role);
  }

  async function updateRole(userId: string, role: string) {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (res.ok) {
      toast.success("User role updated");
      fetchUsers();
    } else {
      toast.error("Failed to update role");
    }
  }

  async function confirmRoleChange() {
    if (!confirmAdminGrant) {
      toast.error("Please confirm you want to grant admin access");
      return;
    }

    if (pendingRoleChange) {
      await updateRole(pendingRoleChange.userId, pendingRoleChange.role);
      setConfirmDialogOpen(false);
      setPendingRoleChange(null);
      setConfirmAdminGrant(false);
    }
  }

  function cancelRoleChange() {
    setConfirmDialogOpen(false);
    setPendingRoleChange(null);
    setConfirmAdminGrant(false);
    // Refresh to reset the select dropdown
    fetchUsers();
  }

  async function handleDelete(userId: string) {
    if (!confirm("Delete this user and all their designs? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("User deleted");
      fetchUsers();
    } else {
      toast.error("Failed to delete user");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-muted-foreground">Manage registered users</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Designs</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name || "—"}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Select value={user.role} onValueChange={(v) => handleRoleChange(user.id, v, user.name || user.email)}>
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">User</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{user._count.designs}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(user.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Admin Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={(open) => !open && cancelRoleChange()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grant Admin Access?</DialogTitle>
            <DialogDescription>
              You are about to grant admin privileges to {pendingRoleChange?.userName}
            </DialogDescription>
          </DialogHeader>

          {/* Warning Banner */}
          <div className="bg-destructive/10 border border-destructive/20 rounded p-4 flex gap-3">
            <WarningTriangle width={20} height={20} className="text-destructive flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-destructive mb-1">Admin Access Warning</p>
              <p className="text-muted-foreground">
                Admins have full access to manage products, categories, templates, users, and all platform settings. Only grant admin access to trusted individuals.
              </p>
            </div>
          </div>

          {/* Confirmation Checkbox */}
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded border border-border">
            <Switch
              id="confirm-admin-grant"
              checked={confirmAdminGrant}
              onCheckedChange={setConfirmAdminGrant}
            />
            <div className="flex-1">
              <Label htmlFor="confirm-admin-grant" className="cursor-pointer font-semibold text-sm">
                I confirm this person should have full admin access
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                This user will be able to manage all aspects of the platform
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={cancelRoleChange}>
              Cancel
            </Button>
            <Button
              onClick={confirmRoleChange}
              disabled={!confirmAdminGrant}
              className="bg-primary hover:bg-primary/90"
            >
              Grant Admin Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
