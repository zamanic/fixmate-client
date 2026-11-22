import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";

import { FeaturedServices, FeaturedServicesSkeleton } from "@/components/home/featured-services";
import { FilmHero } from "@/components/home/film-hero";
import {
  ClosingCta,
  HowItWorks,
  PopularCategories,
  WhyChooseUs,
} from "@/components/home/landing-sections";
import { SectionHeading } from "@/components/home/reveal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Book a trusted technician, on demand",
  description:
    "FixMate connects you with verified technicians for smartphones, laptops, appliances and home electrical work. Send one request, track the job live, and pay only after it is fixed.",
};

/**
 * Landing page.
 *
 * Order: the scroll-film hero (a self-contained lets-scroll experience that
 * takes ~5.5 viewports) → featured listings fetched from the API → the static
 * story sections. Everything below the hero is wrapped in an opaque, raised
 * layer so it paints over the film's fixed backdrop once you scroll past it.
 */
export default function Home() {
  return (
    <>
      <FilmHero />

      <div className="relative z-10 bg-background">
        <section className="fm-section">
          <div className="fm-shell">
            <SectionHeading
              eyebrow="Fresh this week"
              title="Featured services"
              description="The newest approved listings from FixMate technicians — real people, fixed prices, and a repair you can track from request to completion."
              action={
                <Link
                  href="/services"
                  className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
                >
                  Browse all services
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              }
            />

            <div className="mt-10">
              <Suspense fallback={<FeaturedServicesSkeleton />}>
                <FeaturedServices />
              </Suspense>
            </div>
          </div>
        </section>

        <HowItWorks />
        <PopularCategories />
        <WhyChooseUs />
        <ClosingCta />
      </div>
    </>
  );
}
