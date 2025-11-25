import { getDatabase } from "@/lib/mongodb"

export async function ensureIndexes() {
  try {
    const db = await getDatabase()

    // Posts indexes - optimize feed queries
    await db.collection("posts").createIndex({ createdAt: -1 }, { background: true })
    await db.collection("posts").createIndex({ userId: 1 }, { background: true })
    await db.collection("posts").createIndex({ "likes": 1 }, { background: true, sparse: true })
    console.log("✓ Posts indexes created")

    // Projects indexes
    await db.collection("projects").createIndex({ createdAt: -1 }, { background: true })
    await db.collection("projects").createIndex({ userId: 1 }, { background: true })
    await db.collection("projects").createIndex({ "likes": 1 }, { background: true, sparse: true })
    console.log("✓ Projects indexes created")

    // Events indexes
    await db.collection("college_events").createIndex({ date: 1 }, { background: true })
    await db.collection("college_events").createIndex({ category: 1 }, { background: true })
    await db.collection("college_events").createIndex({ "date": 1, "category": 1 }, { background: true })
    console.log("✓ Events indexes created")

    // Jobs indexes
    await db.collection("jobs").createIndex({ createdAt: -1 }, { background: true })
    await db.collection("jobs").createIndex({ userId: 1 }, { background: true })
    console.log("✓ Jobs indexes created")

    // Users indexes
    await db.collection("users").createIndex({ name: 1 }, { background: true })
    await db.collection("users").createIndex({ email: 1 }, { background: true, unique: true })
    await db.collection("users").createIndex({ username: 1 }, { background: true, sparse: true })
    console.log("✓ Users indexes created")

    // Notifications indexes - for faster retrieval
    await db.collection("notifications").createIndex({ recipient: 1, createdAt: -1 }, { background: true })
    await db.collection("notifications").createIndex({ read: 1 }, { background: true })
    console.log("✓ Notifications indexes created")

    // Connection requests indexes
    await db.collection("users").createIndex({ incomingRequests: 1 }, { background: true, sparse: true })
    await db.collection("users").createIndex({ outgoingRequests: 1 }, { background: true, sparse: true })
    console.log("✓ Connection indexes created")
  } catch (error) {
    console.error("Index creation error (may be non-fatal):", error)
  }
}
