import { cn } from "@/lib/utils";

/** Consistent page header used by every dashboard screen. */
export function DashboardHeading({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 pb-6 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div>
        {eyebrow ? <p className="fm-eyebrow">{eyebrow}</p> : null}
        <h1 className="fm-h2 mt-1.5 font-bold text-ink">{title}</h1>
        {description ? (
          <p className="fm-body mt-2 max-w-2xl text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
