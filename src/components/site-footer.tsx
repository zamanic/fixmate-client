import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { NewsletterForm } from "@/components/newsletter-form";
import { FOOTER_CATEGORIES } from "@/lib/nav";

const COMPANY_LINKS = [
  { label: "Home", href: "/" },
  { label: "Explore Services", href: "/services" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "About Us", href: "/about" },
];

const ACCOUNT_LINKS = [
  { label: "Sign in", href: "/sign-in" },
  { label: "Create account", href: "/sign-up" },
  { label: "My dashboard", href: "/dashboard" },
  { label: "Become a technician", href: "/sign-up?role=technician" },
];

/**
 * Build-time year. Cache Components forbids reading the clock during a
 * prerender, so the value is computed once behind `"use cache"` and reused.
 */
async function CopyrightYear() {
  "use cache";
  return <>{new Date().getFullYear()}</>;
}

export function SiteFooter() {
  return (
    <footer className="relative mt-auto overflow-hidden bg-teal text-white">
      <div aria-hidden className="fm-grid absolute inset-0 opacity-10" />
      <div className="fm-shell relative py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1.4fr]">
          <div>
            <Logo href="/" tone="light" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
              FixMate connects you with verified technicians for phones, laptops, appliances and
              home electrical work — transparent pricing, tracked jobs, and payment only after the
              repair is done.
            </p>
          </div>

          <nav aria-label="Company">
            <h2 className="font-heading text-sm font-semibold tracking-wide text-white uppercase">
              Company
            </h2>
            <ul className="mt-4 space-y-2.5">
              {COMPANY_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Account">
            <h2 className="font-heading text-sm font-semibold tracking-wide text-white uppercase">
              Account
            </h2>
            <ul className="mt-4 space-y-2.5">
              {ACCOUNT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-heading text-sm font-semibold tracking-wide text-white uppercase">
              Popular categories
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {FOOTER_CATEGORIES.map((category) => (
                <li key={category}>
                  <Link
                    href={`/services?category=${encodeURIComponent(category)}`}
                    className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs text-white/80 ring-1 ring-white/15 transition-colors hover:bg-white/20 hover:text-white"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-white/70">
              Repair notes and availability updates, once a month.
            </p>
            <div className="mt-3">
              <NewsletterForm />
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/12 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-white/50">
            © <CopyrightYear /> FixMate. Built for the Web Application assignment.
          </p>
          <p className="text-xs text-white/50">
            Technicians are reviewed by FixMate admins before their first job.
          </p>
        </div>
      </div>
    </footer>
  );
}
