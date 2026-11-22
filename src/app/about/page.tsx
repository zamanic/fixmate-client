import type { Metadata } from "next";

import { AboutSections } from "@/components/about/about-sections";

export const metadata: Metadata = {
  title: "About us",
  description:
    "Why FixMate exists: verified technicians, a price agreed before work starts, a job status you can follow and payment only after the repair is done.",
};

export default function AboutPage() {
  return <AboutSections />;
}
