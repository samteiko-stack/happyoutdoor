import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardEmptyState() {
  return (
    <section className="motion-enter flex flex-col items-start justify-between gap-6 rounded-xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:p-8">
      <div>
        <h2 className="text-heading-3">Start your first design</h2>
        <p className="mt-1 max-w-md text-body">
          Lay out your balcony, place products, unlock shopping links when you&apos;re ready.
        </p>
      </div>
      <Button asChild className="shrink-0">
        <Link href="/designer">
          <Plus width={16} height={16} />
          New design
        </Link>
      </Button>
    </section>
  );
}
