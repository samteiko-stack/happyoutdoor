"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash, User } from "iconoir-react";

interface Admin {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminSettingsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<Admin | null>(null);
  
  // Add admin dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminName, setNewAdminName] = useState("");
  const [addingAdmin, setAddingAdmin] = useState(false);

  // Update profile state
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [adminsRes, sessionRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/auth/session"),
      ]);
      
      if (adminsRes.ok) {
        const data = await adminsRes.json();
        const adminUsers = data.filter((u: Admin) => u.role === "admin");
        setAdmins(adminUsers);
      }
      
      if (sessionRes.ok) {
        const session = await sessionRes.json();
        if (session?.user) {
          setCurrentUser(session.user);
          setProfileName(session.user.name || "");
          setProfileEmail(session.user.email || "");
        }
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddAdmin() {
    if (!newAdminEmail.trim()) {
      toast.error("Email is required");
      return;
    }

    setAddingAdmin(true);
    try {
      const res = await fetch("/api/admin/add-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newAdminEmail.trim(),
          name: newAdminName.trim() || null,
        }),
      });

      if (res.ok) {
        toast.success("Admin added successfully");
        setAddDialogOpen(false);
        setNewAdminEmail("");
        setNewAdminName("");
        loadData();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to add admin");
      }
    } catch (error) {
      console.error("Failed to add admin:", error);
      toast.error("Failed to add admin");
    } finally {
      setAddingAdmin(false);
    }
  }

  async function handleRemoveAdmin(adminId: string) {
    if (adminId === currentUser?.id) {
      toast.error("You cannot remove yourself");
      return;
    }

    if (!confirm("Are you sure you want to remove this admin?")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/remove-admin/${adminId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Admin removed successfully");
        loadData();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to remove admin");
      }
    } catch (error) {
      console.error("Failed to remove admin:", error);
      toast.error("Failed to remove admin");
    }
  }

  async function handleUpdateProfile() {
    if (!profileName.trim() || !profileEmail.trim()) {
      toast.error("Name and email are required");
      return;
    }

    setUpdatingProfile(true);
    try {
      const res = await fetch("/api/admin/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileName.trim(),
          email: profileEmail.trim(),
        }),
      });

      if (res.ok) {
        toast.success("Profile updated successfully");
        loadData();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setUpdatingProfile(false);
    }
  }

  async function handleUpdatePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await fetch("/api/admin/update-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (res.ok) {
        toast.success("Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to update password");
      }
    } catch (error) {
      console.error("Failed to update password:", error);
      toast.error("Failed to update password");
    } finally {
      setUpdatingPassword(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Admin Settings</h2>
        <p className="text-sm text-primary mt-1">
          Manage administrators and your account settings
        </p>
      </div>

      {/* My Profile */}
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Name</Label>
              <Input
                id="profile-name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input
                id="profile-email"
                type="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>
          </div>
          <Button
            onClick={handleUpdateProfile}
            disabled={updatingProfile}
            className="bg-primary hover:bg-primary/90"
          >
            {updatingProfile ? "Updating..." : "Update Profile"}
          </Button>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your login password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <Button
            onClick={handleUpdatePassword}
            disabled={updatingPassword}
            className="bg-primary hover:bg-primary/90"
          >
            {updatingPassword ? "Updating..." : "Update Password"}
          </Button>
        </CardContent>
      </Card>

      {/* Manage Admins */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Administrators</CardTitle>
              <CardDescription>Manage admin users for the platform</CardDescription>
            </div>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus width={16} height={16} className="mr-2" />
                  Add Admin
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Administrator</DialogTitle>
                  <DialogDescription>
                    Create a new admin account. They will receive an email to set their password.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-admin-email">Email *</Label>
                    <Input
                      id="new-admin-email"
                      type="email"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      placeholder="admin@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-admin-name">Name (optional)</Label>
                    <Input
                      id="new-admin-name"
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                      placeholder="Admin Name"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddAdmin}
                    disabled={addingAdmin}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {addingAdmin ? "Adding..." : "Add Admin"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Added</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <User width={16} height={16} className="text-muted-foreground" />
                      {admin.name || "—"}
                      {admin.id === currentUser?.id && (
                        <Badge variant="secondary" className="ml-2">You</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-primary">Admin</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {admin.id !== currentUser?.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAdmin(admin.id)}
                        className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                      >
                        <Trash width={16} height={16} />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
