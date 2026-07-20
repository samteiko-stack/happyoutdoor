import { AppPageHeader } from "@/components/layout";

interface AdminPageHeaderProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function AdminPageHeader({
  title,
  description,
  actions,
  className,
}: AdminPageHeaderProps) {
  return (
    <AppPageHeader
      title={title}
      meta={description}
      actions={actions}
      className={className}
    />
  );
}
