"use client";

import { useRef, useState } from "react";
import { ImageUp, Link2 } from "lucide-react";
import { toast } from "sonner";

import { ServiceImage } from "@/components/services/service-image";
import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * The listing photo field.
 *
 * Uploads go to ImgBB and only set the URL when a key is configured; without a
 * key the upload button is hidden and the always-present "paste an image URL"
 * input becomes the only (and perfectly valid) way to set the photo. Both
 * paths write the same value, so the form never depends on which one is used.
 */
const IMGBB_KEY = (process.env.NEXT_PUBLIC_IMGBB_API_KEY ?? "").trim();
const MAX_BYTES = 5 * 1024 * 1024;

export function ImageField({
  value,
  onChange,
  invalid,
}: {
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const canUpload = IMGBB_KEY.length > 0;

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file — JPG, PNG or WebP.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("That photo is larger than 5 MB. Please pick a smaller one.");
      return;
    }

    setUploading(true);
    try {
      const body = new FormData();
      body.append("image", file);
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, {
        method: "POST",
        body,
      });
      const json = (await res.json()) as { data?: { url?: string } };
      const url = json?.data?.url;
      if (!res.ok || !url) throw new Error("upload failed");
      onChange(url);
      toast.success("Photo uploaded.");
    } catch {
      toast.error("The photo upload didn't go through. Please try again or paste a URL.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor="service-image-url">Photo</Label>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-muted ring-1 ring-foreground/10 sm:w-56 sm:shrink-0">
          <ServiceImage src={value.trim()} alt="Service listing preview" />
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          {canUpload ? (
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => void handleFile(event.target.files?.[0])}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? <Spinner className="mr-1.5" /> : <ImageUp className="mr-1.5" />}
                {uploading ? "Uploading…" : "Upload a photo"}
              </Button>
            </div>
          ) : null}

          <div className="grid gap-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              {canUpload ? "Or paste an image URL" : "Paste an image URL"}
            </p>
            <div className="relative">
              <Link2
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="service-image-url"
                type="url"
                value={value}
                maxLength={500}
                placeholder="https://example.com/photo.jpg"
                onChange={(event) => onChange(event.target.value)}
                aria-invalid={invalid || undefined}
                className="pl-8"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {canUpload
                ? "Upload a file (max 5 MB) or paste a direct link — both set the same photo."
                : "Photo uploads are switched off right now. Paste a direct image link instead."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
