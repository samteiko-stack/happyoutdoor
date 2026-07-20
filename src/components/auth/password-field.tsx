"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PasswordFieldProps {
  id: string;
  name?: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  labelAction?: React.ReactNode;
  className?: string;
}

export function PasswordField({
  id,
  name = "password",
  label,
  placeholder = "Enter your password",
  required = true,
  autoComplete = "current-password",
  labelAction,
  className,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        {labelAction}
      </div>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className="h-11 pr-10"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff width={16} height={16} /> : <Eye width={16} height={16} />}
        </Button>
      </div>
    </div>
  );
}
