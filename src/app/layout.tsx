import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Geist_Mono, Inter, Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "next-themes";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const display = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FixMate | Book a trusted technician",
    template: "%s | FixMate",
  },
  description:
    "FixMate connects you with verified technicians for smartphones, laptops, appliances and home electrical work. Transparent hourly rates, live job tracking and pay only when the job is done.",
  applicationName: "FixMate",
  keywords: [
    "repair marketplace",
    "technician booking",
    "appliance repair",
    "device repair",
    "FixMate",
  ],
  openGraph: {
    title: "FixMate | Book a trusted technician",
    description:
      "Verified technicians for phones, laptops, appliances and electrical work. Track the job live and pay only after completion.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6faf9" },
    { media: "(prefers-color-scheme: dark)", color: "#08181a" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${body.variable} ${display.variable} ${mono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider delay={150}>
            <div className="flex min-h-dvh flex-col">
              <Suspense fallback={<HeaderFallback />}>
                <SiteHeader />
              </Suspense>
              <div className="flex flex-1 flex-col">{children}</div>
              <SiteFooter />
            </div>
          </TooltipProvider>
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}

/**
 * The navbar reads the URL (`usePathname`) and the session, so on a route with
 * a dynamic segment it can only resolve at request time. Cache Components needs
 * it behind a boundary; this keeps the exact header geometry so nothing shifts.
 */
function HeaderFallback() {
  return (
    <header className="fm-glass-header sticky top-0 z-40 border-b">
      <div className="fm-shell grid h-16 grid-cols-[1fr_auto] items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <div className="h-7 w-28 rounded-md bg-muted" />
        <div className="hidden items-center gap-3 lg:flex">
          <div className="h-5 w-14 rounded-md bg-muted" />
          <div className="h-5 w-24 rounded-md bg-muted" />
          <div className="h-5 w-20 rounded-md bg-muted" />
          <div className="h-5 w-16 rounded-md bg-muted" />
        </div>
        <div className="flex items-center justify-end gap-2">
          <div className="size-8 rounded-full bg-muted" />
          <div className="hidden h-9 w-20 rounded-lg bg-muted sm:block" />
        </div>
      </div>
    </header>
  );
}
