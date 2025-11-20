import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDatabase();

    const [users, projects, posts, events, jobs] = await Promise.all([
      db.collection("users").countDocuments({}),
      db.collection("projects").countDocuments({}),
      db.collection("posts").countDocuments({}),
      db.collection("college_events").countDocuments({}),
      db.collection("jobs").countDocuments({}),
    ]);

    return NextResponse.json({ users, projects, posts, events, jobs }, { status: 200 });
  } catch (e) {
    console.error("Stats error:", e);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
