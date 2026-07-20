/** Paths and rules for admin vs customer workspace separation. */

export function isCustomerWorkspacePath(pathname: string, search = "") {
  if (pathname === "/dashboard") return true;
  if (pathname === "/designs" || pathname.startsWith("/designs/")) return true;
  if (pathname === "/settings") return true;

  if (pathname === "/designer" || pathname.startsWith("/designer/")) {
    const params = new URLSearchParams(search);
    // Admins may only open the designer to edit a template.
    return !params.get("template");
  }

  return false;
}

export function isAdminRole(role: string | null | undefined) {
  return role?.toUpperCase() === "ADMIN";
}
