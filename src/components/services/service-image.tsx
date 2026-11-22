"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Listing image with a graceful fallback: a missing or broken URL renders a
 * muted placeholder instead of the browser's broken-image icon. The parent
 * controls the box (aspect ratio, tint, rounding) — this only fills it.
 */
export function ServiceImage({
  src,
  alt,
  priority = false,
  className,
  iconClassName,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  iconClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showFallback = !src || failed;

  return (
    <div className={cn("relative h-full w-full", className)}>
      {showFallback ? (
        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
          <ImageOff className={cn("size-7", iconClassName)} aria-hidden />
          <span className="sr-only">{alt}</span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}
