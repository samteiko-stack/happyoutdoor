import { Avatar, Style } from "@dicebear/core";
import loreleiNeutral from "@dicebear/styles/lorelei-neutral.json";

const avatarStyle = new Style(loreleiNeutral);

const AVATAR_BACKGROUNDS = ["eef0ea", "c5cbba", "d8ddd0", "f5f6f2"];

export function getAvatarSeed(input: {
  id?: string;
  email?: string | null;
  name?: string | null;
}): string {
  return input.email ?? input.name ?? input.id ?? "user";
}

export function createDiceBearAvatarSvg(seed: string, size = 64): string {
  const svg = new Avatar(avatarStyle, {
    seed,
    size,
    backgroundColor: AVATAR_BACKGROUNDS,
  }).toString();

  return svg
    .replace(/\swidth="[^"]*"/, "")
    .replace(/\sheight="[^"]*"/, "")
    .replace(
      "<svg ",
      '<svg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" '
    );
}

export function createDiceBearAvatarUri(seed: string, size = 64): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(createDiceBearAvatarSvg(seed, size))}`;
}

export function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  return email?.charAt(0).toUpperCase() ?? "U";
}
