"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AuthFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
}

function useFieldState(
  value: AuthFieldProps["value"],
  defaultValue: AuthFieldProps["defaultValue"]
) {
  const [focused, setFocused] = useState(false);
  const [uncontrolled, setUncontrolled] = useState(String(defaultValue ?? ""));
  const resolved = value !== undefined ? String(value) : uncontrolled;
  const hasValue = resolved.length > 0;

  return {
    focused,
    setFocused,
    hasValue,
    onValueChange: (next: string) => {
      if (value === undefined) setUncontrolled(next);
    },
  };
}

const fieldInputClass = cn(
  "h-9 w-full min-w-0 bg-transparent text-sm text-foreground outline-none",
  "placeholder:text-sm placeholder:text-muted-foreground",
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
);

const fieldShellClass = cn(
  "motion-interactive relative rounded-xl border border-border bg-card px-4 pb-3 pt-5",
  "focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/15"
);

const fieldLabelClass =
  "motion-label pointer-events-none absolute left-4 top-2 text-xs font-medium text-muted-foreground origin-top-left";

export function AuthField({
  id,
  label,
  className,
  type = "text",
  value,
  defaultValue,
  placeholder,
  onFocus,
  onBlur,
  onChange,
  ...props
}: AuthFieldProps) {
  const { focused, setFocused, hasValue, onValueChange } = useFieldState(
    value,
    defaultValue
  );

  return (
    <div className={cn(fieldShellClass, className)}>
      <label
        htmlFor={id}
        className={cn(
          fieldLabelClass,
          (focused || hasValue) && "motion-label-compact"
        )}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        data-slot="input"
        value={value}
        defaultValue={defaultValue}
        placeholder={!hasValue ? placeholder : ""}
        className={fieldInputClass}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        onChange={(e) => {
          onValueChange(e.target.value);
          onChange?.(e);
        }}
        {...props}
      />
    </div>
  );
}

interface AuthPasswordFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  id: string;
  label: string;
}

export function AuthPasswordField({
  id,
  label,
  className,
  value,
  defaultValue,
  placeholder,
  onFocus,
  onBlur,
  onChange,
  ...props
}: AuthPasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const { focused, setFocused, hasValue, onValueChange } = useFieldState(
    value,
    defaultValue
  );

  return (
    <div className={cn(fieldShellClass, className)}>
      <label
        htmlFor={id}
        className={cn(
          fieldLabelClass,
          (focused || hasValue) && "motion-label-compact"
        )}
      >
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type={visible ? "text" : "password"}
          data-slot="input"
          value={value}
          defaultValue={defaultValue}
          placeholder={!hasValue ? placeholder : ""}
          className={cn(fieldInputClass, "pr-1")}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          onChange={(e) => {
            onValueChange(e.target.value);
            onChange?.(e);
          }}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="shrink-0 text-muted-foreground hover:text-foreground"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff width={16} height={16} /> : <Eye width={16} height={16} />}
        </Button>
      </div>
    </div>
  );
}
