/** Maps Supabase snake_case rows to camelCase objects expected by the frontend. */

export function mapProfile(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    email: row.email as string,
    name: (row.name as string | null) ?? null,
    role: row.role as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function mapCategory(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    icon: (row.icon as string | null) ?? null,
    sortOrder: row.sort_order as number,
    createdAt: row.created_at as string,
  };
}

export function mapProduct(row: Record<string, unknown>, category?: Record<string, unknown> | null) {
  const cat = category ?? (row.categories as Record<string, unknown> | null);
  return {
    id: row.id as string,
    name: row.name as string,
    categoryId: (row.category_id as string | null) ?? null,
    category: cat ? mapCategory(cat) : null,
    description: (row.description as string | null) ?? null,
    price: row.price as number,
    affiliateLink: (row.affiliate_link as string | null) ?? null,
    imageUrl: (row.image_url as string | null) ?? null,
    topViewImageUrl: (row.top_view_image_url as string | null) ?? null,
    modelUrl: (row.model_url as string | null) ?? null,
    widthCm: row.width_cm as number,
    heightCm: row.height_cm as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function mapTemplate(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string | null) ?? null,
    thumbnailUrl: (row.thumbnail_url as string | null) ?? null,
    balconyWidthCm: row.balcony_width_cm as number,
    balconyHeightCm: row.balcony_height_cm as number,
    layoutData: row.layout_data as string,
    isPublished: row.is_published as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function mapDesign(
  row: Record<string, unknown>,
  template?: Record<string, unknown> | null
) {
  const tpl = template ?? (row.templates as Record<string, unknown> | null);
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    templateId: (row.template_id as string | null) ?? null,
    template: tpl ? mapTemplate(tpl) : undefined,
    balconyWidthCm: row.balcony_width_cm as number,
    balconyHeightCm: row.balcony_height_cm as number,
    layoutData: row.layout_data as string,
    thumbnailUrl: (row.thumbnail_url as string | null) ?? null,
    isPaid: row.is_paid as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function mapPayment(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    designId: row.design_id as string,
    amount: row.amount as number,
    currency: row.currency as string,
    stripeSessionId: (row.stripe_session_id as string | null) ?? null,
    status: row.status as string,
    createdAt: row.created_at as string,
  };
}

/** Convert camelCase API input to snake_case DB columns */
export function toDbProduct(data: Record<string, unknown>) {
  return {
    name: data.name,
    category_id: data.categoryId ?? null,
    description: data.description ?? null,
    price: data.price ?? 0,
    affiliate_link: data.affiliateLink ?? null,
    image_url: data.imageUrl ?? null,
    top_view_image_url: data.topViewImageUrl ?? null,
    model_url: data.modelUrl ?? null,
    width_cm: data.widthCm ?? 50,
    height_cm: data.heightCm ?? 50,
  };
}

export function toDbTemplate(data: Record<string, unknown>) {
  return {
    name: data.name,
    description: data.description ?? null,
    thumbnail_url: data.thumbnailUrl ?? null,
    balcony_width_cm: data.balconyWidthCm ?? 300,
    balcony_height_cm: data.balconyHeightCm ?? 200,
    layout_data:
      typeof data.layoutData === "string"
        ? data.layoutData
        : JSON.stringify(data.layoutData ?? []),
    is_published: data.isPublished ?? false,
  };
}

export function toDbDesign(data: Record<string, unknown>, userId?: string) {
  return {
    ...(userId && { user_id: userId }),
    name: data.name ?? "My Balcony Design",
    template_id: data.templateId ?? null,
    balcony_width_cm: data.balconyWidthCm ?? 300,
    balcony_height_cm: data.balconyHeightCm ?? 200,
    layout_data:
      typeof data.layoutData === "string"
        ? data.layoutData
        : JSON.stringify(data.layoutData ?? []),
    thumbnail_url: data.thumbnailUrl ?? null,
    is_paid: false,
  };
}

export function toDbCategory(data: Record<string, unknown>) {
  return {
    name: data.name,
    slug: data.slug,
    icon: data.icon ?? null,
    sort_order: data.sortOrder ?? 0,
  };
}
