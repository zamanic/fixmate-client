"use client";

import { useEffect, useRef, useState } from "react";
import { ImageOff, ImageUp, Link2 } from "lucide-react";
import { toast } from "sonner";

import { ServiceImage } from "@/components/services/service-image";
import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  IMAGE_ACCEPT,
  REJECTION_MESSAGE,
  UPLOAD_FAILED_MESSAGE,
  imageRejection,
  uploadToImgbb,
} from "@/lib/imgbb";

/**
 * The listing photo field.
 *
 * "Upload image" hands the file to ImgBB and writes the hosted URL straight
 * into the form's image value; the local file is previewed immediately (object
 * URL) so the box fills the moment something is picked. Pasting a direct URL
 * remains an equal fallback — both paths set the same value, so the form never
 * depends on which one was used.
 *
 * The upload plumbing itself (key, limits, ImgBB call, copy) lives in
 * `@/lib/imgbb` so this picker and the profile photo field stay identical.
 */
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
  const objectUrlRef = useRef<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  // A selected file's object URL outlives the render that created it, so it is
  // released explicitly instead of relying on garbage collection.
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  function clearPreview() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setLocalPreview(null);
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;

    const rejection = imageRejection(file);
    if (rejection) {
      toast.error(REJECTION_MESSAGE[rejection]);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    clearPreview();
    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setLocalPreview(objectUrl);

    setUploading(true);
    try {
      onChange(await uploadToImgbb(file));
      toast.success("Image uploaded to ImgBB.");
    } catch {
      toast.error(UPLOAD_FAILED_MESSAGE);
    } finally {
      setUploading(false);
      clearPreview();
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const shown = localPreview ?? value.trim();

  return (
    <div className="grid gap-2">
      <Label htmlFor="service-image-url">Service image</Label>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-muted ring-1 ring-foreground/10 sm:w-56 sm:shrink-0">
          {shown ? (
            <ServiceImage src={shown} alt="Service listing preview" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted-foreground">
              <ImageOff className="size-6" aria-hidden />
              <span className="text-xs">No image yet</span>
            </div>
          )}
          {uploading ? (
            <div className="absolute inset-0 grid place-items-center bg-card/70">
              <Spinner className="size-5" />
            </div>
          ) : null}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <input
              ref={fileRef}
              type="file"
              accept={IMAGE_ACCEPT}
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
              {uploading ? "Uploading…" : "Upload image"}
            </Button>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Uploaded through the ImgBB step. JPG or PNG, up to 8 MB.
            </p>
          </div>

          <div className="grid gap-1.5">
            <p className="text-xs font-medium text-muted-foreground">Or paste an image URL</p>
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
                placeholder="https://i.ibb.co/…/photo.jpg"
                onChange={(event) => onChange(event.target.value)}
                aria-invalid={invalid || undefined}
                className="pl-8"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Both routes set the same photo — upload a file or paste a direct link.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
