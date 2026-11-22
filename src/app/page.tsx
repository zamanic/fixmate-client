import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const STATUSES = [
  { label: "Requested", className: "bg-status-requested/12 text-status-requested" },
  { label: "Accepted", className: "bg-status-accepted/12 text-status-accepted" },
  { label: "In Progress", className: "bg-status-inprogress/12 text-status-inprogress" },
  { label: "Completed", className: "bg-status-completed/12 text-status-completed" },
  { label: "Rejected", className: "bg-status-rejected/12 text-status-rejected" },
  { label: "Cancelled", className: "bg-status-cancelled/12 text-status-cancelled" },
];

const CATEGORIES = [
  { label: "Smartphone", tint: "bg-tint-smartphone" },
  { label: "Laptop & PC", tint: "bg-tint-laptop" },
  { label: "AC", tint: "bg-tint-ac" },
  { label: "Refrigerator", tint: "bg-tint-refrigerator" },
  { label: "TV", tint: "bg-tint-tv" },
  { label: "Washing Machine", tint: "bg-tint-washing" },
  { label: "Electrical", tint: "bg-tint-electrical" },
];

export default function Home() {
  return (
    <main className="fm-shell fm-section">
      <p className="fm-eyebrow">Verified technicians · Pay after service</p>
      <h1 className="fm-h1 mt-3 max-w-3xl font-bold text-ink">
        Your device is broken. FixMate finds the hands.
      </h1>
      <p className="fm-body mt-4 max-w-2xl text-muted-foreground">
        Design-system checkpoint — F0. Fonts, tokens, status palette and category
        tints render here before any product surface is built on top of them.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button>Find a technician</Button>
        <Button variant="outline">How it works</Button>
      </div>

      <section className="mt-12">
        <h2 className="fm-h3 font-semibold">Job status palette</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <Badge key={s.label} className={`rounded-full border-0 ${s.className}`}>
              {s.label}
            </Badge>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="fm-h3 font-semibold">Category tints</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <Card key={c.label} className="fm-card-hover h-full">
              <CardHeader>
                <div className={`h-24 rounded-lg ${c.tint}`} aria-hidden />
                <CardTitle className="pt-2">{c.label}</CardTitle>
                <CardDescription>Line art for {c.label} repairs.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="px-0">
                  Browse {c.label}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
