import { ScrollRail } from "@/components/ui/scroll-rail";
import { SizeStarterCard } from "@/components/dashboard/size-starter-card";

const STARTERS = [
  { name: "Compact", width: 200, height: 150 },
  { name: "Standard", width: 300, height: 200 },
  { name: "Wide", width: 400, height: 200 },
  { name: "Deep", width: 300, height: 250 },
  { name: "Spacious", width: 450, height: 250 },
] as const;

export function DashboardStarters({ className }: { className?: string }) {
  return (
    <ScrollRail visibleCount={5} bleed={false} className={className}>
      {STARTERS.map((starter) => (
        <SizeStarterCard
          key={starter.name}
          name={starter.name}
          width={starter.width}
          height={starter.height}
          className="h-full"
        />
      ))}
    </ScrollRail>
  );
}
