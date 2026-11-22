import { BadgeCheck, CalendarClock, ShieldCheck } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const POINTS = [
  {
    icon: ShieldCheck,
    title: "Verified technicians",
    body: "Every profile is reviewed by a FixMate admin before it can be booked.",
  },
  {
    icon: CalendarClock,
    title: "Live job tracking",
    body: "Follow each repair from request to completion on a single timeline.",
  },
  {
    icon: BadgeCheck,
    title: "Pay after the fix",
    body: "Your card is only charged once the technician marks the job complete.",
  },
];

/**
 * Shared frame for `/sign-in` and `/sign-up`: brand story on the left,
 * form card on the right. Collapses to a single column below `lg`.
 */
export function AuthShell({
  title,
  subtitle,
  switchText,
  switchLabel,
  switchHref,
  children,
}: {
  title: string;
  subtitle: string;
  switchText: string;
  switchLabel: string;
  switchHref: string;
  children: React.ReactNode;
}) {
  return (
    <div className="fm-shell flex w-full flex-1 items-center py-10 sm:py-14">
      <div className="grid w-full gap-10 lg:grid-cols-2 lg:items-stretch lg:gap-12">
        <aside className="relative hidden overflow-hidden rounded-3xl bg-teal p-8 text-white lg:flex lg:flex-col lg:justify-between">
          <div aria-hidden className="fm-grid absolute inset-0 opacity-15" />
          <div className="relative">
            <Logo href={null} tone="light" />
            <h2 className="mt-10 font-heading text-3xl leading-tight font-bold text-balance">
              The repair you need, from a technician you can check.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70">
              FixMate lists smartphones, laptops, appliances and home electrical work with
              transparent pricing and an audited job history.
            </p>
            <ul className="mt-10 space-y-6">
              {POINTS.map((point) => (
                <li key={point.title} className="flex gap-3.5">
                  <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-white/12 ring-1 ring-white/15">
                    <point.icon className="size-4" strokeWidth={2.2} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{point.title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-white/65">
                      {point.body}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <p className="relative mt-10 text-xs text-white/50">
            FixMate · Book a trusted technician, on demand.
          </p>
        </aside>

        <div className="flex w-full flex-col justify-center">
          <div className="mb-6 lg:hidden">
            <Logo />
          </div>
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="font-heading text-2xl font-bold">{title}</CardTitle>
              <CardDescription>{subtitle}</CardDescription>
            </CardHeader>
            <CardContent>
              {children}
              <p className="mt-6 text-sm text-muted-foreground">
                {switchText}{" "}
                <a
                  href={switchHref}
                  className="font-medium text-signal underline-offset-4 hover:underline"
                >
                  {switchLabel}
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
