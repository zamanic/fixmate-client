import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Camera, CheckCircle2, ClipboardCheck, Eye, Sparkles } from "lucide-react";

import { DashboardHeading } from "@/components/dashboard/dashboard-heading";
import { ServiceForm } from "@/components/technician/service-form";
import { getCurrentUser } from "@/lib/auth-server";

/** Session-gated: blocks until the user is verified — see `src/app/dashboard/layout.tsx`. */
export const instant = false;

export const metadata: Metadata = {
  title: "Add a service",
  description:
    "List a new repair service on FixMate with a category, base price and service area. A FixMate admin reviews every listing before it goes live.",
};

/** The review story shown beside the form, in the order it actually happens. */
const REVIEW_STEPS = [
  {
    icon: Sparkles,
    title: "You submit the listing",
    body: "Everything you enter here is saved exactly as written — price, area and photo included.",
  },
  {
    icon: ClipboardCheck,
    title: "A FixMate admin reviews it",
    body: "We check the details are complete and the photo is genuinely yours. This usually takes under a day.",
  },
  {
    icon: Eye,
    title: "It goes live in Explore Services",
    body: "Once approved, customers can find the service, compare your price and send a repair request.",
  },
];

/** Photo guidance — the checklist a technician should meet before publishing. */
const PHOTO_TIPS = [
  "Use your own clear, well-lit photo of the work you do.",
  "Show the service, not a stock image or a logo.",
  "Landscape works best — it fills the card without cropping.",
  "Keep it under 5 MB, or paste a direct image link.",
];

export default async function AddServicePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?redirectTo=/dashboard/technician/add-service");
  if (user.role !== "technician") redirect("/unauthorized");

  return (
    <div className="space-y-8">
      <DashboardHeading
        eyebrow="New listing"
        title="Add a service"
        description="Tell customers what you repair, how you work and what it costs. You can edit any of this later from My Services."
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 max-w-2xl">
          <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
            <ServiceForm mode="create" />
          </div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
            <h2 className="fm-h3 font-semibold text-ink">What happens next</h2>
            <ol className="mt-4 space-y-4">
              {REVIEW_STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-teal/10 text-teal">
                    <step.icon className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">
                      {index + 1}. {step.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
            <h2 className="fm-h3 flex items-center gap-2 font-semibold text-ink">
              <Camera className="size-4 text-signal" aria-hidden />
              A first-rate photo
            </h2>
            <ul className="mt-4 space-y-2.5">
              {PHOTO_TIPS.map((tip) => (
                <li key={tip} className="flex gap-2.5 text-xs text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-signal" aria-hidden />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
