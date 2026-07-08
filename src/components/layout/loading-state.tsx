import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = "Loading...", className }: LoadingStateProps) {
  return (
    <div className={cn("min-h-screen flex items-center justify-center bg-background", className)}>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
