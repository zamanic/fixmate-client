"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  Plus,
  Receipt,
  Store,
  UserRound,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DASHBOARD_NAV } from "@/lib/nav";
import { initials, ROLE_LABEL, type AppUser } from "@/lib/types";
import { cn } from "@/lib/utils";

const NAV_ICONS: Record<string, LucideIcon> = {
  Overview: LayoutDashboard,
  "My Bookings": CalendarCheck,
  Payments: CreditCard,
  "Add Service": Plus,
  "My Services": Store,
  "Job Requests": ClipboardList,
  Users: Users,
  Services: Wrench,
  Bookings: CalendarCheck,
  Transactions: Receipt,
  "Update Profile": UserRound,
};

function isActive(pathname: string, href: string) {
  return pathname === href;
}

/**
 * Role-aware dashboard frame: identity card + rail on desktop, a scrolling
 * pill row on mobile. The guard itself lives in the route layouts.
 */
export function DashboardShell({
  user,
  children,
}: {
  user: AppUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const links = [
    ...DASHBOARD_NAV[user.role],
    { label: "Update Profile", href: "/dashboard/profile" },
  ];

  return (
    <div className="fm-shell w-full flex-1 py-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        <aside className="lg:w-64 lg:shrink-0">
          <div className="lg:sticky lg:top-24 lg:space-y-4">
            <div className="flex items-center gap-3 rounded-2xl bg-card p-3.5 ring-1 ring-foreground/10">
              <Avatar size="lg">
                {user.image ? <AvatarImage src={user.image} alt="" /> : null}
                <AvatarFallback className="bg-teal text-sm font-semibold text-white">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-heading text-sm font-semibold text-ink">
                  {user.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                <Badge className="mt-1.5 rounded-full border-0 bg-signal/12 text-signal">
                  {ROLE_LABEL[user.role]}
                </Badge>
              </div>
            </div>

            <nav aria-label="Dashboard" className="hidden flex-col gap-1 lg:flex">
              {links.map((link) => {
                const Icon = NAV_ICONS[link.label] ?? LayoutDashboard;
                const active = isActive(pathname, link.href);
                return (
                  <Link
                    key={link.href + link.label}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-teal/10 text-teal ring-1 ring-teal/20"
                        : "text-muted-foreground hover:bg-muted hover:text-ink"
                    )}
                  >
                    <Icon className="size-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <nav
            aria-label="Dashboard sections"
            className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden"
          >
            {links.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium ring-1 transition-colors",
                    active
                      ? "bg-teal text-white ring-teal"
                      : "bg-card text-muted-foreground ring-foreground/10 hover:text-ink"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          {children}
        </div>
      </div>
    </div>
  );
}
