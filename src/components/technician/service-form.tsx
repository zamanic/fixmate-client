"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useAnimationControls } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Spinner } from "@/components/spinner";
import { ImageField } from "@/components/technician/image-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, apiPatch, apiPost } from "@/lib/api";
import { shake } from "@/lib/motion/variants";
import {
  formatMoney,
  SERVICE_CATEGORIES,
  SERVICE_MODES,
  type Service,
  type ServiceCategory,
  type ServiceMode,
} from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * The one service form, shared by the add page (create) and the edit dialog
 * (edit). Validation runs on submit only — invalid fields get the red ring via
 * `aria-invalid`, the first problem is toasted, and the form shakes. Nothing is
 * ever sent to the API until the whole payload is valid.
 */
const LIMITS = { title: 120, description: 1200, duration: 60, area: 120, image: 500 };
const MIN_DESCRIPTION = 20;

export function ServiceForm({
  mode,
  service,
  onDone,
}: {
  mode: "create" | "edit";
  service?: Service;
  onDone?: () => void;
}) {
  const router = useRouter();
  const controls = useAnimationControls();

  const [title, setTitle] = useState(service?.title ?? "");
  const [category, setCategory] = useState(service?.category ?? "");
  const [basePrice, setBasePrice] = useState(service ? String(service.basePrice) : "");
  const [estimatedDuration, setEstimatedDuration] = useState(service?.estimatedDuration ?? "");
  const [serviceMode, setServiceMode] = useState(service?.serviceMode ?? "");
  const [serviceArea, setServiceArea] = useState(service?.serviceArea ?? "");
  const [image, setImage] = useState(service?.image ?? "");
  const [description, setDescription] = useState(service?.description ?? "");
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const priceValue = Number(basePrice);
  const titleOk = title.trim().length >= 2 && title.trim().length <= LIMITS.title;
  const categoryOk = (SERVICE_CATEGORIES as readonly string[]).includes(category);
  const priceOk = basePrice.trim() !== "" && Number.isFinite(priceValue) && priceValue > 0;
  const durationOk =
    estimatedDuration.trim().length > 0 && estimatedDuration.trim().length <= LIMITS.duration;
  const modeOk = (SERVICE_MODES as readonly string[]).includes(serviceMode);
  const areaOk = serviceArea.trim().length >= 2 && serviceArea.trim().length <= LIMITS.area;
  const imageOk = image.trim().length > 0 && image.trim().length <= LIMITS.image;
  const descOk = description.trim().length >= MIN_DESCRIPTION;
  const showErrors = submitted;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSubmitted(true);

    const problem = !titleOk
      ? "Give your service a title of 2–120 characters."
      : !categoryOk
        ? "Pick the category this service belongs to."
        : !priceOk
          ? "Enter a base price greater than zero."
          : !durationOk
            ? "Add an estimated duration, for example “45–90 min”."
            : !modeOk
              ? "Choose how customers receive this service."
              : !areaOk
                ? "Describe the area you cover (2–120 characters)."
                : !imageOk
                  ? "Add a photo — upload one or paste an image URL."
                  : !descOk
                    ? `Describe the service in at least ${MIN_DESCRIPTION} characters.`
                    : null;

    if (problem) {
      void controls.start("shake");
      toast.error(problem);
      return;
    }

    const body = {
      title: title.trim(),
      category: category as ServiceCategory,
      description: description.trim(),
      image: image.trim(),
      basePrice: priceValue,
      estimatedDuration: estimatedDuration.trim(),
      serviceMode: serviceMode as ServiceMode,
      serviceArea: serviceArea.trim(),
    };

    setSaving(true);
    try {
      if (mode === "edit" && service) {
        await apiPatch<{ message: string; service: Service }>(
          `/api/services/${service._id}`,
          body,
          true
        );
        toast.success("Listing updated — it's back in review for approval.");
        onDone?.();
      } else {
        await apiPost<{ message: string; service: Service }>("/api/services", body, true);
        toast.success("Service submitted for review.");
        router.push("/dashboard/technician/my-services");
        router.refresh();
      }
    } catch (error) {
      void controls.start("shake");
      toast.error(
        error instanceof ApiError ? error.message : "We couldn't save your service. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.form
      animate={controls}
      variants={shake}
      onSubmit={handleSubmit}
      noValidate
      className="space-y-6"
    >
      {mode === "edit" ? (
        <div className="flex items-start gap-3 rounded-xl bg-status-inprogress/10 p-3.5 text-sm ring-1 ring-status-inprogress/25">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-status-inprogress" aria-hidden />
          <p className="text-ink">
            Saving sends this listing back to <strong className="font-medium">Pending</strong> — a
            FixMate admin reviews every edit before it goes live again.
          </p>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="service-title">Title</Label>
          <Input
            id="service-title"
            value={title}
            maxLength={LIMITS.title}
            placeholder="iPhone screen replacement in a day"
            onChange={(event) => setTitle(event.target.value)}
            aria-invalid={(showErrors && !titleOk) || undefined}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="service-category">Category</Label>
          <Select value={category} onValueChange={(value) => setCategory(value ?? "")}>
            <SelectTrigger
              id="service-category"
              className="w-full"
              aria-invalid={(showErrors && !categoryOk) || undefined}
            >
              <SelectValue>
                {(value) => (value ? String(value) : "Select a category")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {SERVICE_CATEGORIES.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="service-mode">Service mode</Label>
          <Select value={serviceMode} onValueChange={(value) => setServiceMode(value ?? "")}>
            <SelectTrigger
              id="service-mode"
              className="w-full"
              aria-invalid={(showErrors && !modeOk) || undefined}
            >
              <SelectValue>
                {(value) => (value ? String(value) : "Select a mode")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {SERVICE_MODES.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="service-price">Base price</Label>
            <span className="text-xs text-muted-foreground">
              Starts at{" "}
              <span className="font-semibold text-ink">
                {formatMoney(priceOk ? priceValue : 0)}
              </span>
            </span>
          </div>
          <Input
            id="service-price"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={basePrice}
            placeholder="45"
            onChange={(event) => setBasePrice(event.target.value)}
            aria-invalid={(showErrors && !priceOk) || undefined}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="service-duration">Estimated duration</Label>
          <Input
            id="service-duration"
            value={estimatedDuration}
            maxLength={LIMITS.duration}
            placeholder="45–90 min"
            onChange={(event) => setEstimatedDuration(event.target.value)}
            aria-invalid={(showErrors && !durationOk) || undefined}
          />
        </div>

        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="service-area">Service area</Label>
          <Input
            id="service-area"
            value={serviceArea}
            maxLength={LIMITS.area}
            placeholder="Dhanmondi and nearby areas, Dhaka"
            onChange={(event) => setServiceArea(event.target.value)}
            aria-invalid={(showErrors && !areaOk) || undefined}
          />
        </div>
      </div>

      <ImageField value={image} onChange={setImage} invalid={showErrors && !imageOk} />

      <div className="grid gap-2">
        <Label htmlFor="service-description">Description</Label>
        <Textarea
          id="service-description"
          value={description}
          maxLength={LIMITS.description}
          rows={5}
          placeholder="What you fix, what's included, and what the customer should have ready."
          onChange={(event) => setDescription(event.target.value)}
          aria-invalid={(showErrors && !descOk) || undefined}
        />
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-muted-foreground">
            At least {MIN_DESCRIPTION} characters so customers know what to expect.
          </span>
          <span
            aria-live="polite"
            className={cn(descOk ? "text-muted-foreground" : "text-status-inprogress")}
          >
            {description.length}/{LIMITS.description}
          </span>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
        <Button type="submit" size="lg" className="h-10 w-full sm:w-auto" disabled={saving}>
          {saving ? <Spinner className="mr-2" /> : null}
          {saving ? "Saving…" : mode === "edit" ? "Save changes" : "Publish listing"}
        </Button>
      </div>
    </motion.form>
  );
}
