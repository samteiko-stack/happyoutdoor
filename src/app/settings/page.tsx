"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/components/providers/SupabaseProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { AppLayout, AppPage, LoadingState, PageStack } from "@/components/layout";
import { StatusBadge } from "@/components/admin";
import { UserAvatar } from "@/components/user-avatar";

interface UserData {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  _count: { designs: number; payments: number };
}

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    async function loadUser() {
      const res = await fetch("/api/user/settings");
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setName(data.name || "");
        setEmail(data.email);
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      if (res.ok) {
        const updated = await res.json();
        setUser((prev) => prev ? { ...prev, ...updated } : prev);
        toast.success("Profile updated successfully");
        // Update the session to reflect new name/email
        await updateSession();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update profile");
      }
    } catch {
      toast.error("Something went wrong");
    }
    setSaving(false);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (res.ok) {
        toast.success("Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to change password");
      }
    } catch {
      toast.error("Something went wrong");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <AppLayout>
        <AppPage>
          <LoadingState message="Loading settings…" />
        </AppPage>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <AppPage>
        <PageStack>
        {/* Account overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <UserAvatar
                  id={user?.id}
                  name={user?.name}
                  email={user?.email}
                  size="lg"
                  className="size-14"
                />
                <div>
                  <CardTitle>{user?.name || "User"}</CardTitle>
                  <CardDescription>{user?.email}</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={user?.role?.toUpperCase() === "ADMIN" ? "admin" : "user"} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-surface-muted rounded-lg p-3">
                <p className="text-2xl font-bold text-primary">{user?._count.designs || 0}</p>
                <p className="text-xs text-muted-foreground">Designs</p>
              </div>
              <div className="bg-surface-muted rounded-lg p-3">
                <p className="text-2xl font-bold text-primary">{user?._count.payments || 0}</p>
                <p className="text-xs text-muted-foreground">Purchases</p>
              </div>
              <div className="bg-surface-muted rounded-lg p-3">
                <p className="text-2xl font-bold text-primary">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—"}
                </p>
                <p className="text-xs text-muted-foreground">Joined</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile form */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <Button type="submit" disabled={saving} className="gap-2">
                {saving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save width={16} height={16} />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password form */}
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={saving || !currentPassword || !newPassword}
                variant="outline"
                className="gap-2"
              >
                {saving ? (
                  "Changing..."
                ) : (
                  <>
                    <Save width={16} height={16} />
                    Change Password
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        </div>
        </PageStack>
      </AppPage>
    </AppLayout>
  );
}
