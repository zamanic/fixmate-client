import type { Role } from "@/lib/types";

/**
 * Route vocabulary shared by the navbar, the footer and the dashboard rail.
 * Kept in one place so a route rename only ever happens once.
 */

/** Where a signed-in user belongs, per role. */
export function dashboardPathFor(role: Role | string | undefined | null): string {
  switch (role) {
    case "admin":
      return "/dashboard/admin";
    case "technician":
      return "/dashboard/technician";
    default:
      return "/dashboard/customer";
  }
}

/** True when `pathname` is the route (or a child of it) named by `href`. */
export function isActivePath(pathname: string, href: string): boolean {
  const [path, hash] = href.split("#");
  if (hash) return false;
  if (path === "/") return pathname === "/";
  return pathname === path || pathname.startsWith(`${path}/`);
}

export interface NavLink {
  label: string;
  href: string;
}

/** Marketing navbar — same order on every breakpoint. */
export const PUBLIC_NAV: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Explore Services", href: "/services" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "About Us", href: "/about" },
];

/** Popular categories in the footer — same strings as the service contract. */
export const FOOTER_CATEGORIES: string[] = [
  "Smartphone",
  "Laptop & PC",
  "AC",
  "Refrigerator",
  "TV",
  "Washing Machine",
  "Electrical",
];

/** Dashboard rail, one list per role. Icons map to lucide names in the shell. */
export const DASHBOARD_NAV: Record<Role, NavLink[]> = {
  customer: [
    { label: "Overview", href: "/dashboard/customer" },
    { label: "My Bookings", href: "/dashboard/customer/bookings" },
    { label: "Payments", href: "/dashboard/customer/payments" },
  ],
  technician: [
    { label: "Overview", href: "/dashboard/technician" },
    { label: "Add Service", href: "/dashboard/technician/add-service" },
    { label: "My Services", href: "/dashboard/technician/my-services" },
    { label: "Job Requests", href: "/dashboard/technician/requests" },
  ],
  admin: [
    { label: "Overview", href: "/dashboard/admin" },
    { label: "Users", href: "/dashboard/admin/users" },
    { label: "Services", href: "/dashboard/admin/services" },
    { label: "Bookings", href: "/dashboard/admin/bookings" },
    { label: "Transactions", href: "/dashboard/admin/transactions" },
  ],
};
