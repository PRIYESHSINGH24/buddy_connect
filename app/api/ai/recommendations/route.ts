import { NextRequest, NextResponse } from "next/server";
import {
  generatePostSuggestions,
  generateJobRecommendations,
  generateProfileImprovementSuggestions,
  generateEventRecommendations,
  generateProjectIdeas,
  improvePostContent,
  generateSkillRecommendations,
} from "@/lib/ai-utils";

export async function POST(request: NextRequest) {
  try {
    const { action, userProfile, recentPosts, interests, postContent } =
      await request.json();

    if (!action) {
      return NextResponse.json(
        { error: "Action not specified" },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case "post-suggestions":
        result = await generatePostSuggestions(userProfile, recentPosts);
        break;

      case "job-recommendations":
        result = await generateJobRecommendations(userProfile);
        break;

      case "profile-improvements":
        result = await generateProfileImprovementSuggestions(userProfile);
        break;

      case "event-recommendations":
        result = await generateEventRecommendations(userProfile, interests);
        break;

      case "project-ideas":
        result = await generateProjectIdeas(userProfile);
        break;

      case "improve-post":
        result = await improvePostContent(postContent);
        break;

      case "skill-recommendations":
        result = await generateSkillRecommendations(
          userProfile.skills || []
        );
        break;

      default:
        return NextResponse.json(
          { error: "Unknown action" },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("AI API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI recommendations" },
      { status: 500 }
    );
  }
}
