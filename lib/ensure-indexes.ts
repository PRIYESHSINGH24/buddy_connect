import { getDatabase } from "@/lib/mongodb"

export async function ensureIndexes() {
  try {
    const db = await getDatabase()

    // Posts indexes
    await db.collection("posts").createIndex({ createdAt: -1 })
    await db.collection("posts").createIndex({ userId: 1 })
    console.log("✓ Posts indexes created")

    // Projects indexes
    await db.collection("projects").createIndex({ createdAt: -1 })
    await db.collection("projects").createIndex({ userId: 1 })
    console.log("✓ Projects indexes created")

    // Events indexes
    await db.collection("college_events").createIndex({ date: 1 })
    await db.collection("college_events").createIndex({ category: 1 })
    console.log("✓ Events indexes created")

    // Jobs indexes
    await db.collection("jobs").createIndex({ createdAt: -1 })
    console.log("✓ Jobs indexes created")

    // Users indexes
    await db.collection("users").createIndex({ name: 1 })
    console.log("✓ Users indexes created")
  } catch (error) {
    console.error("Index creation error (may be non-fatal):", error)
  }
}
