"use client";

import * as React from "react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

function Checkbox({
  className,
  checked,
  defaultChecked,
  onCheckedChange,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  const isControlled = checked !== undefined;
  const [optimisticChecked, setOptimisticChecked] = React.useState<
    boolean | "indeterminate"
  >(checked ?? defaultChecked ?? false);
  const pendingRef = React.useRef(false);

  React.useEffect(() => {
    if (isControlled && !pendingRef.current) {
      setOptimisticChecked(checked);
    }
  }, [checked, isControlled]);

  function handleCheckedChange(next: boolean | "indeterminate") {
    const previous = optimisticChecked;
    setOptimisticChecked(next);

    const result = onCheckedChange?.(next);
    if (result && typeof (result as PromiseLike<void>).then === "function") {
      pendingRef.current = true;
      Promise.resolve(result)
        .catch(() => setOptimisticChecked(previous))
        .finally(() => {
          pendingRef.current = false;
        });
    }
  }

  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "motion-interactive peer size-4 shrink-0 rounded-[4px] border border-input bg-background outline-none",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        "data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        className
      )}
      checked={isControlled ? optimisticChecked : checked}
      defaultChecked={defaultChecked}
      onCheckedChange={handleCheckedChange}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="checkbox-indicator flex items-center justify-center text-current"
      >
        <Check className="size-3" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
