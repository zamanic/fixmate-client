import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { servicesHref, type ServiceQuery } from "./service-query";

/**
 * Compact page list — always keeps the first page, the last page and the
 * current page ±1, collapsing the gaps into an ellipsis.
 */
function pageItems(current: number, total: number): (number | "gap")[] {
  const items: (number | "gap")[] = [];
  for (let page = 1; page <= total; page += 1) {
    if (page === 1 || page === total || Math.abs(page - current) <= 1) {
      items.push(page);
    } else if (items[items.length - 1] !== "gap") {
      items.push("gap");
    }
  }
  return items;
}

/**
 * Numbered pagination for the Explore grid. Every link is built from the active
 * filter set, so paging never drops a filter — and the ends of the range are
 * rendered as disabled, non-interactive steps.
 */
export function ServicePagination({
  page,
  pages,
  query,
  className,
}: {
  page: number;
  pages: number;
  query: ServiceQuery;
  className?: string;
}) {
  if (pages <= 1) return null;

  return (
    <nav
      aria-label="Service results pages"
      className={cn(
        "flex flex-col items-center gap-4 sm:flex-row sm:justify-between",
        className
      )}
    >
      <p className="text-sm text-muted-foreground">
        Page <span className="font-medium text-ink">{page}</span> of {pages}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <PageStep query={query} target={page - 1} disabled={page <= 1} dir="prev" />

        {pageItems(page, pages).map((item, index) =>
          item === "gap" ? (
            <span
              key={`gap-${index}`}
              className="select-none px-1 text-sm text-muted-foreground"
              aria-hidden
            >
              …
            </span>
          ) : (
            <Link
              key={item}
              href={servicesHref(query, item)}
              aria-current={item === page ? "page" : undefined}
              className={cn(
                buttonVariants({
                  variant: item === page ? "default" : "outline",
                  size: "icon-sm",
                })
              )}
            >
              {item}
            </Link>
          )
        )}

        <PageStep query={query} target={page + 1} disabled={page >= pages} dir="next" />
      </div>
    </nav>
  );
}

function PageStep({
  query,
  target,
  disabled,
  dir,
}: {
  query: ServiceQuery;
  target: number;
  disabled: boolean;
  dir: "prev" | "next";
}) {
  const Icon = dir === "prev" ? ChevronLeft : ChevronRight;
  const label = dir === "prev" ? "Previous page" : "Next page";

  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className={cn(
          buttonVariants({ variant: "outline", size: "icon-sm" }),
          "pointer-events-none opacity-50"
        )}
      >
        <Icon />
        <span className="sr-only">{label}</span>
      </span>
    );
  }

  return (
    <Link
      href={servicesHref(query, target)}
      className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}
    >
      <Icon />
      <span className="sr-only">{label}</span>
    </Link>
  );
}
