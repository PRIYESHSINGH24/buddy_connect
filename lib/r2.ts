import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3"

// Cloudflare R2 is S3-compatible — we use the AWS SDK with R2 endpoint
const r2Client =
  process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID
    ? new S3Client({
        region: "auto",
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
        },
      })
    : null

const BUCKET_NAME = process.env.R2_BUCKET_NAME || "buddy-connect-media"
const PUBLIC_URL = process.env.R2_PUBLIC_URL || ""

/**
 * Upload a file to Cloudflare R2.
 * @param buffer - File content as Buffer
 * @param key - Storage key (e.g. "posts/{postId}/{filename}")
 * @param contentType - MIME type
 * @returns Public URL of the uploaded file, or null if R2 is not configured
 */
export async function uploadToR2(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string | null> {
  if (!r2Client) {
    console.warn("R2 not configured — skipping upload for key:", key)
    return null
  }

  try {
    await r2Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      })
    )

    return `${PUBLIC_URL}/${key}`
  } catch (error) {
    console.error("R2 upload error:", error)
    throw new Error(`Failed to upload to R2: ${key}`)
  }
}

/**
 * Delete a file from Cloudflare R2.
 */
export async function deleteFromR2(key: string): Promise<void> {
  if (!r2Client) return

  try {
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      })
    )
  } catch (error) {
    console.error("R2 delete error:", error)
  }
}

/**
 * Generate a storage key for a post attachment.
 */
export function postAttachmentKey(
  postId: string,
  index: number,
  filename: string
): string {
  // Sanitize filename
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100)
  return `posts/${postId}/${index}-${safe}`
}

/**
 * Check if R2 storage is configured.
 */
export function isR2Configured(): boolean {
  return r2Client !== null
}
