import { cn } from "@/lib/utils";

type ContainerSize = "large" | "medium" | "small";
type SectionSize = "large" | "medium" | "small";

/**
 * Client-First section shell:
 *   padding-global → container-* → padding-section-* → .landing-type
 *
 * Marketing copy must sit in .landing-type. Never put the designer embed inside it.
 */
export function LandingSection({
  id,
  container = "large",
  section = "large",
  className,
  children,
}: {
  id?: string;
  container?: ContainerSize;
  section?: SectionSize;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={className}>
      <div className="padding-global">
        <div className={`container-${container}`}>
          <div className={cn(`padding-section-${section}`, "landing-type")}>{children}</div>
        </div>
      </div>
    </section>
  );
}

/** Nav / hero structure: padding-global → container-* (opt into .landing-type yourself) */
export function LandingContainer({
  size = "large",
  className,
  children,
}: {
  size?: ContainerSize;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="padding-global">
      <div className={cn(`container-${size}`, className)}>{children}</div>
    </div>
  );
}

export function LandingGlass({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return <div className={cn("landing-glass", className)}>{children}</div>;
}
