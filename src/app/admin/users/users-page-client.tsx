"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
import { AlertTriangle } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  _count: { designs: number };
}

export function UsersPageClient({
  initialUsers,
}: {
  initialUsers: User[];
}) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingRoleChange, setPendingRoleChange] = useState<{ userId: string; role: string; userName: string } | null>(null);
  const [confirmAdminGrant, setConfirmAdminGrant] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const { confirm, ConfirmDialog: DeleteConfirmDialog } = useConfirmDialog();

  const fetchUsers = useCallback(async () => {
    const res = await fetch("/api/admin/users");
    if (res.ok) setUsers(await res.json());
  }, []);

  const filtered = useMemo(() => {
    let list = users;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          u.name?.toLowerCase().includes(q)
      );
    }
    if (filterRole !== "all") {
      list = list.filter((u) => u.role === filterRole);
    }
    return list;
  }, [users, searchQuery, filterRole]);

  const pagination = useTablePagination(filtered);
  const pageIds = useMemo(
    () => pagination.pagedItems.map((u) => u.id),
    [pagination.pagedItems]
  );
  const selection = useTableSelection(pageIds);

  async function handleRoleChange(userId: string, role: string, userName: string) {
    if (role === "ADMIN") {
      setPendingRoleChange({ userId, role, userName });
      setConfirmDialogOpen(true);
      return;
    }
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
    fetchUsers();
  }

  async function handleDelete(userId: string) {
    const confirmed = await confirm({
      title: "Delete user?",
      description: "This removes the user and all their designs. This cannot be undone.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!confirmed) return;
    const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("User deleted");
      fetchUsers();
    } else {
      toast.error("Failed to delete user");
    }
  }

  async function handleBulkDelete() {
    const confirmed = await confirm({
      title: `Delete ${selection.selectedCount} users?`,
      description: "This removes each user and all their designs. This cannot be undone.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!confirmed) return;
    const results = await Promise.all(
      selection.selectedIds.map((id) =>
        fetch(`/api/admin/users/${id}`, { method: "DELETE" })
      )
    );
    if (results.every((r) => r.ok)) {
      toast.success(`${selection.selectedCount} users deleted`);
      selection.clear();
      fetchUsers();
    } else {
      toast.error("Some users could not be deleted");
      fetchUsers();
    }
  }

  return (
    <PageStack>
      <DataTableCard
        columns={["Name", "Email", "Role", "Designs", "Joined", ""]}
        isEmpty={filtered.length === 0}
        emptyMessage={searchQuery || filterRole !== "all" ? "No users match your filters" : "No users yet"}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search users…"
        selection={selection}
        onBulkDelete={handleBulkDelete}
        bulkDeleteLabel="Delete users"
        filters={
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="USER">User</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
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
        {pagination.pagedItems.map((user) => (
          <TableRowDefault
            key={user.id}
            rowId={user.id}
            selected={selection.isSelected(user.id)}
            onSelect={() => selection.toggle(user.id)}
          >
            <TableCell className="font-medium text-foreground">{user.name || "—"}</TableCell>
            <TableCell className="text-muted-foreground">{user.email}</TableCell>
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
            <TableCellActions>
              <RowActions
                items={[
                  {
                    label: "Delete user",
                    icon: "delete",
                    destructive: true,
                    onClick: () => handleDelete(user.id),
                  },
                ]}
              />
            </TableCellActions>
          </TableRowDefault>
        ))}
      </DataTableCard>

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grant admin access</DialogTitle>
            <DialogDescription>
              {pendingRoleChange?.userName} will be able to manage products, categories, templates, users, and settings.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-3 rounded-md border border-destructive/20 bg-destructive/10 p-4">
            <AlertTriangle width={20} height={20} className="mt-0.5 shrink-0 text-destructive" />
            <p className="text-sm text-muted-foreground">
              Admin access grants full control over the platform.
            </p>
          </div>

          <div className="flex items-start gap-3 rounded-md border border-border bg-muted/50 p-3">
            <Switch
              id="confirm-admin-grant"
              checked={confirmAdminGrant}
              onCheckedChange={setConfirmAdminGrant}
            />
            <Label htmlFor="confirm-admin-grant" className="cursor-pointer text-sm font-medium">
              I confirm this person should have admin access
            </Label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={cancelRoleChange}>Cancel</Button>
            <Button onClick={confirmRoleChange} disabled={!confirmAdminGrant}>
              Grant admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <DeleteConfirmDialog />
    </PageStack>
  );
}
