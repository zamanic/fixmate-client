"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronDown, LayoutDashboard, LogOut, Menu, User } from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { dashboardPathFor, isActivePath, PUBLIC_NAV } from "@/lib/nav";
import { DURATION, EASE_OUT } from "@/lib/motion/variants";
import { initials, ROLE_LABEL, type Role } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * The single sticky navbar for the whole product. Session state comes from the
 * BetterAuth client hook so the header updates the moment a user signs in or
 * out — and the root layout stays free of uncached data access.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = session?.user as
    | { name?: string | null; email?: string | null; image?: string | null; role?: string | null }
    | undefined;
  const role = (user?.role ?? "customer") as Role;
  const signedIn = Boolean(user);

  async function handleSignOut() {
    setMobileOpen(false);
    await authClient.signOut();
    toast.success("Signed out. See you soon.");
    router.replace("/");
    router.refresh();
  }

  return (
    <header
      className="fm-glass-header sticky top-0 z-40 border-b"
      style={{
        // LightningCSS collapses this to the WebKit prefix in the emitted CSS.
        // Keep the standard property inline so unprefixed browsers still blur.
        backdropFilter: "blur(18px) saturate(140%)",
        WebkitBackdropFilter: "blur(18px) saturate(140%)",
      }}
    >
      {/*
        Three columns on desktop (`1fr auto 1fr`): the logo and the actions take
        the equal outer tracks, so the nav in the middle track lands on the true
        centre of the header however wide either side grows. Below `lg` the nav
        is hidden and the two-track grid keeps logo left / actions right.
      */}
      <div className="fm-shell grid h-16 grid-cols-[1fr_auto] items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <Logo />

        <nav aria-label="Main" className="hidden items-center justify-center gap-1 lg:flex">
          {PUBLIC_NAV.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active ? "text-ink" : "text-muted-foreground hover:text-ink"
                )}
              >
                {item.label}
                {active ? (
                  <motion.span
                    layoutId="nav-rail"
                    transition={{ duration: DURATION.fast, ease: EASE_OUT }}
                    className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-signal"
                  />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center justify-end gap-1.5">
          <ThemeToggle className="hidden sm:inline-flex" />

          {isPending ? (
            <Skeleton className="size-8 rounded-full" />
          ) : signedIn && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    aria-label="Account menu"
                    className="flex items-center gap-1.5 rounded-full p-0.5 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <Avatar>
                      {user.image ? <AvatarImage src={user.image} alt="" /> : null}
                      <AvatarFallback className="bg-teal text-xs font-semibold text-white">
                        {initials(user.name ?? "FixMate")}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="size-3.5 text-muted-foreground" />
                  </button>
                }
              />
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="flex flex-col gap-1 py-1.5">
                    <span className="truncate text-sm font-semibold text-ink">
                      {user.name ?? "FixMate member"}
                    </span>
                    <span className="truncate text-xs font-normal text-muted-foreground">
                      {user.email}
                    </span>
                    <Badge className="mt-1 w-fit rounded-full border-0 bg-signal/12 text-signal">
                      {ROLE_LABEL[role]}
                    </Badge>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href={dashboardPathFor(role)} />}>
                  <LayoutDashboard /> Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/dashboard/profile" />}>
                  <User /> Update profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                  <LogOut /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-1.5 sm:flex">
              <Link href="/sign-in" className={buttonVariants({ variant: "ghost" })}>
                Sign in
              </Link>
              <Link href="/sign-up" className={buttonVariants()}>
                Sign up
              </Link>
            </div>
          )}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                  <Menu />
                </Button>
              }
            />
            <SheetContent side="right" className="w-[85%] max-w-sm p-0">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav aria-label="Mobile" className="flex flex-col gap-1 px-4">
                {PUBLIC_NAV.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "rounded-lg px-3 py-2.5 text-sm font-medium",
                      isActivePath(pathname, item.href)
                        ? "bg-muted text-ink"
                        : "text-muted-foreground hover:bg-muted hover:text-ink"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-4 flex flex-col gap-2 border-t border-border px-4 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Appearance</span>
                  <ThemeToggle />
                </div>
                {signedIn && user ? (
                  <>
                    <Link
                      href={dashboardPathFor(role)}
                      onClick={() => setMobileOpen(false)}
                      className={buttonVariants()}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setMobileOpen(false)}
                      className={buttonVariants({ variant: "outline" })}
                    >
                      Update profile
                    </Link>
                    <Button variant="ghost" onClick={handleSignOut}>
                      <LogOut /> Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/sign-in"
                      onClick={() => setMobileOpen(false)}
                      className={buttonVariants({ variant: "outline" })}
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/sign-up"
                      onClick={() => setMobileOpen(false)}
                      className={buttonVariants()}
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
