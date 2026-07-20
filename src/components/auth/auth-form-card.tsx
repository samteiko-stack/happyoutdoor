import Link from "next/link";
import { cn } from "@/lib/utils";

interface AuthFormCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function AuthFormCard({
  title,
  description,
  children,
  footer,
  className,
}: AuthFormCardProps) {
  return (
    <div className={cn("w-full", className)}>
      <header className="mb-8">
        <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]">
          {description}
        </p>
      </header>
      {children}
      {footer && <div className="mt-8">{footer}</div>}
    </div>
  );
}

export function AuthFormFields({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4">{children}</div>;
}

export function AuthFormActions({ children }: { children: React.ReactNode }) {
  return <div className="mt-6 flex flex-col gap-5">{children}</div>;
}

export function AuthFooterText({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-center text-sm text-muted-foreground">{children}</p>
  );
}

export function AuthLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="motion-interactive font-semibold text-primary underline-offset-4 transition-colors hover:text-brand-moss-dark hover:underline"
    >
      {children}
    </Link>
  );
}
