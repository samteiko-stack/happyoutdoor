import Link from "next/link";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminAddCardProps {
  href: string;
  label: string;
  className?: string;
}

export function AdminAddCard({ href, label, className }: AdminAddCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "motion-interactive flex h-full min-h-[17.5rem] flex-col items-center justify-center gap-2 rounded-xl",
        "border border-dashed border-border bg-surface-subtle/60 text-muted-foreground",
        "hover:border-primary/30 hover:text-foreground",
        className
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-full border border-border bg-card">
        <Plus className="size-5" strokeWidth={1.75} />
      </span>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}
