"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserMenu } from "@/components/UserMenu";
import { FloppyDisk } from "iconoir-react";

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
        await updateSession({ name, email });
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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-primary font-bold text-xl">
              Happy Balcony
            </Link>
            <span className="text-gray-300">|</span>
            <h1 className="font-semibold text-sm">Account Settings</h1>
          </div>
          <UserMenu />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Account overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded bg-accent/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">
                    {user?.name
                      ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                      : user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <CardTitle>{user?.name || "User"}</CardTitle>
                  <CardDescription>{user?.email}</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={user?.role === "ADMIN" ? "default" : "secondary"}>
                  {user?.role === "ADMIN" ? "Admin" : "User"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gray-50 rounded p-3">
                <p className="text-2xl font-bold text-primary">{user?._count.designs || 0}</p>
                <p className="text-xs text-muted-foreground">Designs</p>
              </div>
              <div className="bg-gray-50 rounded p-3">
                <p className="text-2xl font-bold text-primary">{user?._count.payments || 0}</p>
                <p className="text-xs text-muted-foreground">Purchases</p>
              </div>
              <div className="bg-gray-50 rounded p-3">
                <p className="text-2xl font-bold text-primary">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—"}
                </p>
                <p className="text-xs text-muted-foreground">Joined</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile form */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your name and email address</CardDescription>
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
              <Button
                type="submit"
                disabled={saving}
                className="bg-primary hover:bg-primary/90 gap-2"
              >
                {saving ? (
                  "Saving..."
                ) : (
                  <>
                    <FloppyDisk width={16} height={16} />
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
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password to keep your account secure</CardDescription>
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
                    <FloppyDisk width={16} height={16} />
                    Change Password
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Separator />

        <div className="flex justify-center">
          <Link href="/designer">
            <Button className="bg-[#6b7f3b] hover:bg-[#5a6b32]">
              Back to Designer
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
