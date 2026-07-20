export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function getFirstName(name: string | null | undefined, email: string) {
  if (name?.trim()) return name.trim().split(/\s+/)[0]!;
  return email.split("@")[0] ?? "there";
}
