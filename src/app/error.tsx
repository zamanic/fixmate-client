"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw, TriangleAlert } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[FixMate] route error:", error);
  }, [error]);

  return (
    <div className="fm-shell flex flex-1 items-center justify-center py-24">
      <div className="max-w-xl text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-status-inprogress/12 text-status-inprogress">
          <TriangleAlert className="size-6" />
        </span>
        <h1 className="fm-h2 mt-6 font-bold text-ink">Something interrupted that page.</h1>
        <p className="fm-body mt-4 text-muted-foreground">
          The FixMate service returned an unexpected response. Retrying usually clears it — if it
          doesn&apos;t, the API may be offline.
        </p>
        {error.digest ? (
          <p className="mt-3 font-mono text-xs text-muted-foreground">ref {error.digest}</p>
        ) : null}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button size="lg" onClick={reset}>
            <RotateCcw /> Try again
          </Button>
          <Link href="/" className={buttonVariants({ variant: "outline", size: "lg" })}>
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
