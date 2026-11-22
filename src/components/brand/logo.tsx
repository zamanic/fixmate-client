import Link from "next/link";
import { Wrench } from "lucide-react";

/**
 * FixMate wordmark. The orange tile + wrench is the only logo lockup in the
 * product — header, footer and auth screens all render this component.
 */
export function Logo({
  className = "",
  href = "/",
  showWord = true,
  tone = "ink",
}: {
  className?: string;
  /** Pass `null` to render the mark without a link. */
  href?: string | null;
  showWord?: boolean;
  tone?: "ink" | "light";
}) {
  const mark = (
    <span className={`flex items-center gap-2 ${className}`}>
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-signal text-white shadow-sm shadow-signal/30">
        <Wrench className="size-4" strokeWidth={2.5} />
      </span>
      {showWord ? (
        <span
          className={`font-heading text-lg font-extrabold tracking-tight ${
            tone === "light" ? "text-white" : "text-ink"
          }`}
        >
          Fix<span className="text-signal">Mate</span>
        </span>
      ) : null}
    </span>
  );

  if (!href) return mark;

  return (
    <Link
      href={href}
      aria-label="FixMate home"
      className="inline-flex items-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {mark}
    </Link>
  );
}
