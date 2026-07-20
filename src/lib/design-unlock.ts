export function getUnlockPriceCents() {
  const raw =
    process.env.NEXT_PUBLIC_DESIGN_UNLOCK_PRICE ??
    process.env.DESIGN_UNLOCK_PRICE ??
    "999";
  return parseInt(raw, 10);
}

export function formatUnlockPrice(cents = getUnlockPriceCents()) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function getDesignProductSummary(layoutData: string) {
  try {
    const items = JSON.parse(layoutData) as { productId: string }[];
    const uniqueProductIds = [...new Set(items.map((item) => item.productId))];
    return {
      itemCount: items.length,
      productCount: uniqueProductIds.length,
    };
  } catch {
    return { itemCount: 0, productCount: 0 };
  }
}

export function getDesignUnlockHref(designId: string) {
  return `/designs/${designId}/unlock`;
}

export function getDesignLinksHref(designId: string) {
  return `/designs/${designId}/links`;
}
