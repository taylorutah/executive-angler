import sharp from "sharp";

/** Re-encode so GPS/camera EXIF cannot ride along with an upload. */
export async function stripExif(
  input: Buffer,
  mime: string,
): Promise<{ buffer: Buffer; contentType: string }> {
  const image = sharp(input, { failOn: "none" }).rotate();
  if (mime.includes("png")) {
    return { buffer: await image.png().toBuffer(), contentType: "image/png" };
  }
  if (mime.includes("webp")) {
    return { buffer: await image.webp().toBuffer(), contentType: "image/webp" };
  }
  return {
    buffer: await image.jpeg({ quality: 88 }).toBuffer(),
    contentType: "image/jpeg",
  };
}
