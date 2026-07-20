import { createAdminClient } from "@/lib/supabase/admin";
import { mapCategory, mapProduct, mapTemplate } from "@/lib/mappers";
import { requireAdmin } from "@/lib/auth.server";

export async function getAdminCategories() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("categories")
    .select("*, products(count)")
    .order("sort_order");

  if (error) throw error;

  return (data ?? []).map((row) => ({
    ...mapCategory(row),
    _count: { products: (row.products as { count: number }[])?.[0]?.count ?? 0 },
  }));
}

export async function getAdminProducts() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("products")
    .select("*, categories(*)")
    .order("name");

  if (error) throw error;

  return (data ?? []).map((row) => mapProduct(row, row.categories));
}

export async function getAdminTemplates() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("templates")
    .select("*, designs(count)")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    ...mapTemplate(row),
    _count: { designs: (row.designs as { count: number }[])?.[0]?.count ?? 0 },
  }));
}

export async function getAdminUsers() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("*, designs(count)")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    createdAt: row.created_at,
    _count: { designs: (row.designs as { count: number }[])?.[0]?.count ?? 0 },
  }));
}
