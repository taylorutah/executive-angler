/**
 * Client-side image compression utility.
 *
 * Resizes images to a max dimension and compresses to JPEG to stay
 * under Supabase's 5 MB per-file storage limit.
 */

const MAX_DIMENSION = 1200;
const INITIAL_QUALITY = 0.8;
const MAX_UPLOAD_BYTES = 4_500_000; // 4.5 MB — headroom under 5 MB limit

/**
 * Compress an image File/Blob to a JPEG Blob that fits under the upload limit.
 * Returns the compressed Blob, or throws if the image cannot be compressed enough.
 */
export async function compressImage(
  file: File | Blob,
  opts?: { maxDimension?: number; maxBytes?: number }
): Promise<Blob> {
  const maxDim = opts?.maxDimension ?? MAX_DIMENSION;
  const maxBytes = opts?.maxBytes ?? MAX_UPLOAD_BYTES;

  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;

  // Calculate scaled dimensions
  const scale = Math.min(1, maxDim / Math.max(width, height));
  const newW = Math.round(width * scale);
  const newH = Math.round(height * scale);

  const canvas = new OffscreenCanvas(newW, newH);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(bitmap, 0, 0, newW, newH);
  bitmap.close();

  // Progressively lower quality until it fits
  let quality = INITIAL_QUALITY;
  while (quality >= 0.1) {
    const blob = await canvas.convertToBlob({ type: "image/jpeg", quality });
    if (blob.size <= maxBytes) return blob;
    quality -= 0.1;
  }

  // Last resort
  const blob = await canvas.convertToBlob({ type: "image/jpeg", quality: 0.1 });
  if (blob.size <= maxBytes) return blob;

  throw new Error(
    `Photo is too large (${(blob.size / 1_000_000).toFixed(1)} MB after compression). ` +
      "Please use a smaller image (max 5 MB)."
  );
}

/** Size limit constant for display in UI hints. */
export const MAX_UPLOAD_SIZE_MB = 5;
