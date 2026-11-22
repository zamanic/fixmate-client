import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * The centred column every payment outcome page sits in, so `/payment/success`
 * and `/payment/cancel` share exactly one frame.
 */
export function ResultShell({ children }: { children: ReactNode }) {
  return (
    <div className="fm-shell flex flex-1 items-center justify-center py-16">
      <div className="w-full max-w-lg">{children}</div>
    </div>
  );
}

/** One `label → value` line inside a payment summary list. */
export function ResultDetailRow({
  label,
  value,
  mono,
  strong,
}: {
  label: string;
  value: string;
  mono?: boolean;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "min-w-0 truncate text-right text-ink",
          mono && "font-mono text-xs",
          strong && "font-heading text-base font-semibold"
        )}
      >
        {value}
      </dd>
    </div>
  );
}
