"use client";

import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  createDiceBearAvatarUri,
  getAvatarSeed,
  getInitials,
} from "@/lib/dicebear-avatar";
import { cn } from "@/lib/utils";

const SIZE_PX = {
  sm: 24,
  default: 32,
  lg: 40,
} as const;

type UserAvatarProps = {
  id?: string;
  name?: string | null;
  email?: string | null;
  imageUrl?: string | null;
  size?: keyof typeof SIZE_PX;
  className?: string;
};

export function UserAvatar({
  id,
  name,
  email,
  imageUrl,
  size = "default",
  className,
}: UserAvatarProps) {
  const seed = getAvatarSeed({ id, email, name });
  const initials = getInitials(name, email);
  const renderSize = SIZE_PX[size];

  const generatedAvatarUri = useMemo(
    () => createDiceBearAvatarUri(seed, renderSize * 2),
    [seed, renderSize]
  );

  return (
    <Avatar
      size={size}
      className={cn("relative rounded-full", className)}
      aria-label={name || "User avatar"}
    >
      {imageUrl ? (
        <>
          <AvatarImage src={imageUrl} alt={name || "User"} className="object-cover" />
          <AvatarFallback className="rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {initials}
          </AvatarFallback>
        </>
      ) : (
        <img
          src={generatedAvatarUri}
          alt=""
          className="absolute inset-0 size-full object-cover"
          aria-hidden
        />
      )}
    </Avatar>
  );
}
