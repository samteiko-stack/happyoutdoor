import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
  };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-lg border border-border p-16 text-center",
        className
      )}
    >
      <div className="max-w-md mx-auto">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted text-foreground">
          {icon}
        </div>
        <h2 className="text-heading-2 mb-3">{title}</h2>
        <p className="text-body-lg mb-8">{description}</p>
        {action && (
          <Link href={action.href}>
            <Button size="lg">
              {action.icon}
              {action.label}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
