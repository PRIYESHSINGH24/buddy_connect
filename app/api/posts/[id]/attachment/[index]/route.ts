import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; index: string }> }
) {
  try {
    const { id, index } = await params
    const attachmentIndex = parseInt(index, 10)

    if (isNaN(attachmentIndex) || attachmentIndex < 0) {
      return NextResponse.json({ error: "Invalid attachment index" }, { status: 400 })
    }

    const db = await getDatabase()
    
    // Fetch ONLY the specific attachment to save memory
    const post = await db.collection("posts").findOne(
      { _id: new ObjectId(id) },
      { projection: { [`attachments.${attachmentIndex}`]: 1 } }
    )

    if (!post || !post.attachments || !post.attachments[attachmentIndex]) {
      return NextResponse.json({ error: "Attachment not found" }, { status: 404 })
    }

    const file = post.attachments[attachmentIndex]
    
    if (!file.data || typeof file.data !== 'string') {
        return NextResponse.json({ error: "Invalid attachment data" }, { status: 500 })
    }

    // Parse the Data URI (e.g., "data:image/jpeg;base64,/9j/4AAQSkZJRg...")
    const matches = file.data.match(/^data:([^;]+);base64,(.+)$/)

    if (!matches || matches.length !== 3) {
      return NextResponse.json({ error: "Invalid base64 format" }, { status: 500 })
    }

    const mimeType = matches[1]
    const base64Data = matches[2]
    
    // Decode base64 to a raw Buffer
    const buffer = Buffer.from(base64Data, 'base64')

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Length": buffer.length.toString(),
        "Content-Disposition": `inline; filename="${file.name || 'attachment'}"`,
        // Cache aggressively since attachments do not change
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("Get attachment error:", error)
    return NextResponse.json({ error: "Failed to fetch attachment" }, { status: 500 })
  }
}
