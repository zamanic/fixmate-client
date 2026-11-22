"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wrench } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

import { BookingRequestForm } from "./booking-request-form";

/**
 * The primary call to action on a service page.
 *
 * • signed out  → link to sign in, returning to this listing afterwards
 * • customer    → opens the repair-request dialog
 * • technician/admin → a disabled button that explains who can request repairs
 */
export function RequestRepairButton({
  serviceId,
  role,
}: {
  serviceId: string;
  role: Role | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (role === null) {
    return (
      <Link
        href={`/sign-in?redirectTo=/services/${serviceId}`}
        className={cn(buttonVariants({ size: "lg" }), "h-11 w-full")}
      >
        <Wrench /> Sign in to request
      </Link>
    );
  }

  if (role !== "customer") {
    return (
      <div className="space-y-2">
        <Button size="lg" className="h-11 w-full" disabled>
          <Wrench /> Request Repair
        </Button>
        <p className="text-xs text-muted-foreground">
          Only customer accounts can request repairs.
        </p>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="lg" className="h-11 w-full" />}>
        <Wrench /> Request Repair
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Request this repair</DialogTitle>
          <DialogDescription>
            Tell us where and when, and what is wrong. The technician confirms
            availability and the final price before any work starts.
          </DialogDescription>
        </DialogHeader>
        <BookingRequestForm
          serviceId={serviceId}
          onSuccess={() => {
            setOpen(false);
            router.push("/dashboard/customer/bookings");
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
