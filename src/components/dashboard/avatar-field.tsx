"use client";

import { useEffect, useRef, useState } from "react";
import { ImageOff, ImageUp } from "lucide-react";
import { toast } from "sonner";

import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import {
  IMAGE_ACCEPT,
  REJECTION_MESSAGE,
  UPLOAD_FAILED_MESSAGE,
  imageRejection,
  uploadToImgbb,
} from "@/lib/imgbb";
import { cn } from "@/lib/utils";

/**
 * Round profile-photo picker.
 *
 * Same contract as the technician service-photo field — the picked file is
 * previewed at once from an object URL, uploaded to ImgBB in the background,
 * and the hosted URL is written back into the form value — only the shape
 * differs. A photo is optional, so the field declines gracefully instead of
 * blocking the form when uploads are not configured.
 */
export function AvatarField({
  value,
  onChange,
  name,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  name: string;
  className?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  // A preview URL outlives the render that created it, so it is released
  // explicitly rather than left to garbage collection.
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
      toast.success("Profile photo uploaded to ImgBB.");
    } catch {
      toast.error(UPLOAD_FAILED_MESSAGE);
    } finally {
      setUploading(false);
      clearPreview();
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function removePhoto() {
    clearPreview();
    onChange("");
    toast.success("Profile photo removed. Save changes to keep it.");
  }

  const shown = localPreview ?? value.trim();

  return (
    <div className={cn("flex flex-col items-center gap-3 sm:flex-row sm:items-center", className)}>
      <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-full bg-muted ring-1 ring-foreground/10">
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shown} alt="" className="size-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <ImageOff className="size-5" aria-hidden />
            <span className="text-[0.65rem] leading-none">No image yet</span>
          </div>
        )}
      </div>

      <div className="min-w-0 text-center sm:text-left">
        <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
          <input
            ref={fileRef}
            type="file"
            accept={IMAGE_ACCEPT}
            className="hidden"
            onChange={(event) => void handleFile(event.target.files?.[0])}
            aria-label="Choose a profile photo"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Spinner className="mr-1.5" /> : <ImageUp className="mr-1.5" />}
            {uploading ? "Uploading…" : "Upload photo"}
          </Button>
          {value ? (
            <Button type="button" variant="ghost" onClick={removePhoto} disabled={uploading}>
              Remove
            </Button>
          ) : null}
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Uploaded through the ImgBB step. JPG or PNG, up to 8 MB.
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {name.trim()
            ? `${name.trim()} — shown in the navbar and on your services.`
            : "Shown in the navbar and on your services."}
        </p>
      </div>
    </div>
  );
}
