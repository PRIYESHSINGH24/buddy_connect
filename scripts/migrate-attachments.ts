/**
 * One-time migration script: Move base64 attachments from MongoDB to Cloudflare R2.
 *
 * Usage:
 *   npx tsx scripts/migrate-attachments.ts
 *
 * This script:
 * 1. Finds all posts with base64 attachment data
 * 2. Uploads each attachment to R2
 * 3. Updates the post document with the R2 URL
 * 4. Removes the base64 data field
 */

import { MongoClient, ObjectId } from "mongodb"
import { uploadToR2, postAttachmentKey, isR2Configured } from "../lib/r2"

async function migrate() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error("MONGODB_URI is not set")
    process.exit(1)
  }

  if (!isR2Configured()) {
    console.error("R2 is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL")
    process.exit(1)
  }

  const client = new MongoClient(uri)
  await client.connect()
  const db = client.db(process.env.MONGODB_DB_NAME || "college-linkedin")

  console.log("🔍 Finding posts with base64 attachments...")

  // Find posts that have attachments with 'data' field (base64)
  const cursor = db.collection("posts").find({
    "attachments.data": { $exists: true, $ne: "" },
  })

  let migratedCount = 0
  let errorCount = 0
  let totalAttachments = 0

  for await (const post of cursor) {
    const postId = post._id.toString()
    const attachments = post.attachments || []

    console.log(`\n📎 Post ${postId}: ${attachments.length} attachment(s)`)

    const updatedAttachments = []

    for (let i = 0; i < attachments.length; i++) {
      const att = attachments[i]
      totalAttachments++

      if (att.url) {
        // Already migrated
        console.log(`  ✅ [${i}] ${att.name} — already has URL, skipping`)
        updatedAttachments.push(att)
        continue
      }

      if (!att.data) {
        console.log(`  ⚠️ [${i}] ${att.name} — no data, skipping`)
        updatedAttachments.push(att)
        continue
      }

      try {
        // Strip data URL prefix: "data:image/png;base64,ABC..." -> "ABC..."
        const base64Data = att.data.includes(",")
          ? att.data.split(",")[1]
          : att.data

        const buffer = Buffer.from(base64Data, "base64")
        const key = postAttachmentKey(postId, i, att.name)

        const url = await uploadToR2(buffer, key, att.type)
        if (!url) {
          throw new Error("R2 upload returned null")
        }

        console.log(`  ✅ [${i}] ${att.name} (${(buffer.length / 1024).toFixed(1)}KB) → ${url}`)

        updatedAttachments.push({
          name: att.name,
          type: att.type,
          size: att.size || buffer.length,
          url, // New R2 URL
          // 'data' field intentionally omitted
        })
      } catch (error) {
        console.error(`  ❌ [${i}] ${att.name} — upload failed:`, error)
        errorCount++
        updatedAttachments.push(att) // Keep original on error
      }
    }

    // Update post with new attachments (without base64 data)
    await db.collection("posts").updateOne(
      { _id: new ObjectId(postId) },
      { $set: { attachments: updatedAttachments } }
    )
    migratedCount++
  }

  console.log(`\n\n📊 Migration complete:`)
  console.log(`   Posts processed: ${migratedCount}`)
  console.log(`   Attachments processed: ${totalAttachments}`)
  console.log(`   Errors: ${errorCount}`)

  await client.close()
  process.exit(errorCount > 0 ? 1 : 0)
}

migrate().catch((err) => {
  console.error("Migration failed:", err)
  process.exit(1)
})
