import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDatabase();

    try {
      const [users, projects, posts, events, jobs] = await Promise.all([
        db.collection("users").countDocuments({}),
        db.collection("projects").countDocuments({}),
        db.collection("posts").countDocuments({}),
        db.collection("college_events").countDocuments({}),
        db.collection("jobs").countDocuments({}),
      ]);
      return NextResponse.json({ users, projects, posts, events, jobs }, { status: 200 });
    } catch (e) {
      console.error("Stats count error:", e);
      // Graceful fallback when counting fails
      return NextResponse.json({ users: 0, projects: 0, posts: 0, events: 0, jobs: 0, warning: "db_count_failed" }, { status: 200 });
    }
  } catch (e) {
    console.error("Stats DB connect error:", e);
    // Graceful fallback when DB is unreachable
    return NextResponse.json({ users: 0, projects: 0, posts: 0, events: 0, jobs: 0, warning: "db_unavailable" }, { status: 200 });
  }
}
