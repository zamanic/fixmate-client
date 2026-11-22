/**
 * ImgBB upload plumbing shared by every image picker in the app — technician
 * service photos and the profile photo.
 *
 * The key is resolved once at module scope: `NEXT_PUBLIC_*` values are inlined
 * at build time, so whether uploads are configured has to be knowable before a
 * button is rendered that would otherwise fail silently.
 */
export const IMGBB_KEY = (process.env.NEXT_PUBLIC_IMGBB_API_KEY ?? "").trim();

/** ImgBB's ceiling for a free upload, and the limit the pickers enforce. */
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

/** `accept` attribute shared by the file inputs. */
export const IMAGE_ACCEPT = "image/jpeg,image/png";

const ACCEPTED_TYPES = ["image/jpeg", "image/png"];

/** Why a picked file was refused — `null` means it is good to upload. */
export function imageRejection(file: File): "type" | "size" | "unconfigured" | null {
  if (!ACCEPTED_TYPES.includes(file.type)) return "type";
  if (file.size > MAX_IMAGE_BYTES) return "size";
  if (!IMGBB_KEY) return "unconfigured";
  return null;
}

/** Copy for each refusal reason, so every picker explains itself the same way. */
export const REJECTION_MESSAGE = {
  type: "Choose a JPG or PNG image.",
  size: "That image is larger than 8 MB. Please pick a smaller one.",
  unconfigured: "Image uploads aren't configured yet. Paste a direct image URL instead.",
} as const;

/** Shown when ImgBB refuses the upload itself. */
export const UPLOAD_FAILED_MESSAGE =
  "The image upload didn't go through. Please try again or paste a URL.";

/** Posts the file to ImgBB and resolves with the hosted URL. Throws on failure. */
export async function uploadToImgbb(file: File): Promise<string> {
  const body = new FormData();
  body.append("image", file);

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, {
    method: "POST",
    body,
  });
  const json = (await res.json().catch(() => null)) as { data?: { url?: string } } | null;
  const url = json?.data?.url;
  if (!res.ok || !url) throw new Error("ImgBB upload failed");
  return url;
}
