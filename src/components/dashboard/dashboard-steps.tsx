import { cn } from "@/lib/utils";

const STEPS = [
  { n: "01", title: "Set size", body: "Match your balcony dimensions." },
  { n: "02", title: "Place products", body: "Arrange furniture and plants." },
  { n: "03", title: "Unlock links", body: "Shop the pieces you chose." },
] as const;

export function DashboardSteps({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3",
        className
      )}
    >
      {STEPS.map((step) => (
        <div key={step.n} className="bg-card px-5 py-5 sm:px-6 sm:py-6">
          <p className="text-caption font-semibold text-primary">{step.n}</p>
          <p className="mt-2 text-sm font-semibold text-foreground">{step.title}</p>
          <p className="mt-1 text-body">{step.body}</p>
        </div>
      ))}
    </div>
  );
}
