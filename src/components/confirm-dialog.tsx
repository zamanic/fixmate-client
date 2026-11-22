"use client";

import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/spinner";
import { cn } from "@/lib/utils";

/**
 * The one destructive-confirmation surface. The UX contract forbids
 * `window.confirm`, so every delete/cancel goes through this dialog: it states
 * what will happen, and it stays open (with a spinner) while the request is in
 * flight so a double-click can never fire twice.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Keep it",
  destructive = true,
  pending = false,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  pending?: boolean;
  onConfirm: () => void | Promise<void>;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <span
            className={cn(
              "grid size-10 place-items-center rounded-xl",
              destructive
                ? "bg-status-rejected/12 text-status-rejected"
                : "bg-status-inprogress/12 text-status-inprogress"
            )}
          >
            <TriangleAlert className="size-5" />
          </span>
          <DialogTitle className="pt-3">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={() => void onConfirm()}
            disabled={pending}
          >
            {pending ? <Spinner className="mr-2" /> : null}
            {pending ? "Working…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
