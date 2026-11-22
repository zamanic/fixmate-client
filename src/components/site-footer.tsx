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

/*
 * Brand marks are inlined rather than pulled from an icon set: lucide dropped
 * its brand glyphs, so shipping our own keeps the dependency list unchanged
 * (same reasoning as the Google mark on the sign-in page). All three inherit
 * `currentColor`, so the badge's hover colour drives them.
 */
function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-4">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.214-6.817-5.966 6.817H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-4">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.45 2.91h-2.33V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-4">
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.83v1.64h.05c.53-.95 1.83-1.95 3.77-1.95C21.6 8.69 22 11 22 14v7h-4v-6.2c0-1.48-.03-3.38-2.06-3.38-2.06 0-2.38 1.6-2.38 3.27V21h-4V9Z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { label: "X", href: "https://www.x.com/numerizam", icon: XIcon },
  { label: "Facebook", href: "https://www.facebook.com/numerizam", icon: FacebookIcon },
  { label: "LinkedIn", href: "https://linkedin.com/in/numerizam", icon: LinkedInIcon },
] as const;

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
            <ul className="mt-6 flex items-center gap-2.5">
              {SOCIAL_LINKS.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`FixMate on ${social.label} (opens in a new tab)`}
                    className="inline-flex size-9 items-center justify-center rounded-full bg-white/10 text-white/75 ring-1 ring-white/15 transition-colors hover:bg-signal hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                  >
                    <social.icon />
                  </a>
                </li>
              ))}
            </ul>
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
