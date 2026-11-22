import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter, Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "next-themes";

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
    default: "FixMate — Book a trusted technician, on demand",
    template: "%s · FixMate",
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
    title: "FixMate — Book a trusted technician, on demand",
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
            <div className="flex min-h-dvh flex-col">{children}</div>
          </TooltipProvider>
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
