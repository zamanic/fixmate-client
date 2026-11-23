"use client";

import { useState } from "react";
import { ImageOff, type LucideIcon } from "lucide-react";

import { isGeneratedImage } from "@/lib/service-images";
import { cn } from "@/lib/utils";

type ImageStatus = "loading" | "loaded" | "failed";

/**
 * Progressive listing image. The parent owns the box (aspect ratio, tint,
 * rounding) — this only fills it, and always with something worth looking at:
 *
 *   1. a brand shimmer while the file is in flight,
 *   2. a soft cross-fade (`opacity-0` → `opacity-100`) the moment it decodes,
 *   3. a domain-appropriate still (`fallbackSrc`) or a muted icon when the URL
 *      is missing, broken, slow, or a known "image is generating…" placeholder.
 *
 * Nothing here ever surfaces the provider's placeholder, so a slow ImgBB file
 * or a dead URL reads as an intentional empty state rather than a broken tile.
 */
export function ServiceImage({
  src,
  alt,
  priority = false,
  className,
  iconClassName,
  fallbackSrc,
  fallbackIcon: FallbackIcon = ImageOff,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  iconClassName?: string;
  /** Domain-appropriate still shown when the primary image can't be used. */
  fallbackSrc?: string;
  /** Icon for the final fallback — defaults to a broken-image glyph. */
  fallbackIcon?: LucideIcon;
}) {
  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      {/* Re-mounting on `src` re-arms the loading sequence for a swapped image. */}
      <ImageLayer
        key={src}
        src={src}
        alt={alt}
        priority={priority}
        iconClassName={iconClassName}
        fallbackSrc={fallbackSrc}
        FallbackIcon={FallbackIcon}
      />
    </div>
  );
}

function ImageLayer({
  src,
  alt,
  priority,
  iconClassName,
  fallbackSrc,
  FallbackIcon,
}: {
  src: string;
  alt: string;
  priority: boolean;
  iconClassName?: string;
  fallbackSrc?: string;
  FallbackIcon: LucideIcon;
}) {
  // A generated-placeholder URL is a failure up front: it never reaches the DOM.
  const usable = Boolean(src) && !isGeneratedImage(src);
  const [status, setStatus] = useState<ImageStatus>(usable ? "loading" : "failed");
  const [fallbackFailed, setFallbackFailed] = useState(false);

  if (!usable || status === "failed") {
    if (fallbackSrc && !fallbackFailed) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={fallbackSrc}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          onError={() => setFallbackFailed(true)}
          className="fm-img-fade h-full w-full object-cover"
        />
      );
    }
    return (
      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
        <FallbackIcon className={cn("size-7", iconClassName)} aria-hidden />
        <span className="sr-only">{alt}</span>
      </div>
    );
  }

  const loaded = status === "loaded";

  return (
    <>
      {loaded ? null : (
        <span className="fm-shimmer absolute inset-0 block bg-muted" aria-hidden />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("failed")}
        className={cn(
          "fm-img-fade h-full w-full object-cover",
          loaded ? "opacity-100" : "opacity-0"
        )}
      />
    </>
  );
}
