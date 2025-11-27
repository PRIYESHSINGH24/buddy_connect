import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.AI_GATEWAY_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export async function POST(request: NextRequest) {
  try {
    const { conversationHistory, userMessage } = await request.json();

    if (!userMessage) {
      return NextResponse.json(
        { error: "User message is required" },
        { status: 400 }
      );
    }

    const conversationContext = conversationHistory
      .map((m: any) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n");

    const prompt = `You are a helpful AI Career Coach for a LinkedIn-like platform called Buddy Connect. 
You help users with career development, networking, job hunting, skill development, and professional growth.
Be encouraging, specific, and actionable in your advice.
Keep responses concise but helpful (2-3 sentences typically).

Conversation history:
${conversationContext}

User: ${userMessage}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return NextResponse.json({
      success: true,
      message: responseText,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
