import Link from "next/link";
import { SearchX } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="fm-shell flex flex-1 items-center justify-center py-24">
      <div className="max-w-xl text-center">
        <p className="fm-eyebrow">Error 404</p>
        <h1 className="fm-h1 mt-3 font-bold text-ink">
          We couldn&apos;t find that page.
        </h1>
        <p className="fm-body mt-4 text-muted-foreground">
          The link may be broken, or the service listing may have been taken down by its
          technician. Try exploring what&apos;s available right now.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className={buttonVariants({ size: "lg" })}>
            Return to Home
          </Link>
          <Link
            href="/services"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            <SearchX /> Explore services
          </Link>
        </div>
      </div>
    </div>
  );
}
