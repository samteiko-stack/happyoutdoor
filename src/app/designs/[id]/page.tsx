import { redirect } from "next/navigation";
import { auth } from "@/lib/auth.server";
import { getDesignOwnedByUser } from "@/lib/authorization";
import {
  getDesignLinksHref,
  getDesignUnlockHref,
} from "@/lib/design-unlock";

export default async function DesignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;
  const design = await getDesignOwnedByUser(id, session.user.id);
  if (!design) {
    redirect("/designs");
  }

  redirect(design.is_paid ? getDesignLinksHref(id) : getDesignUnlockHref(id));
}
