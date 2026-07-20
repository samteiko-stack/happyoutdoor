import { cn } from "@/lib/utils";

interface PageStackProps {
  children: React.ReactNode;
  className?: string;
}

export function PageStack({ children, className }: PageStackProps) {
  return <div className={cn("page-stack", className)}>{children}</div>;
}

interface PageToolbarProps {
  children: React.ReactNode;
  className?: string;
}

export function PageToolbar({ children, className }: PageToolbarProps) {
  return <div className={cn("page-toolbar", className)}>{children}</div>;
}

interface AppPageHeaderProps {
  title?: string;
  meta?: string;
  actions?: React.ReactNode;
  className?: string;
}

/** Page-level actions row. Title lives in the top bar when inside AppLayout. */
export function AppPageHeader({ title, meta, actions, className }: AppPageHeaderProps) {
  if (!title && !actions) return null;

  if (!title) {
    return <PageToolbar className={className}>{actions}</PageToolbar>;
  }

  return (
    <header className={cn("flex items-center justify-between gap-4", className)}>
      <div className="min-w-0">
        <h2 className="text-heading-2">{title}</h2>
        {meta && <p className="mt-1 text-sm text-muted-foreground">{meta}</p>}
      </div>
      {actions && <PageToolbar>{actions}</PageToolbar>}
    </header>
  );
}

interface AppPageProps {
  children: React.ReactNode;
  className?: string;
}

export function AppPage({ children, className }: AppPageProps) {
  return <div className={cn("w-full", className)}>{children}</div>;
}
