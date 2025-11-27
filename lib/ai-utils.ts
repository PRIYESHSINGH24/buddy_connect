import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.AI_GATEWAY_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export async function generatePostSuggestions(
  userProfile: string,
  recentPosts?: string[]
): Promise<string[]> {
  try {
    const prompt = `Based on this LinkedIn-like profile: "${userProfile}", generate 3 engaging post ideas that would resonate with their network. 
    ${recentPosts ? `Recent posts: ${recentPosts.join(", ")}` : ""}
    Return ONLY a JSON array of 3 strings, each being a post suggestion. Example format: ["Post idea 1", "Post idea 2", "Post idea 3"]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error("Error generating post suggestions:", error);
    return [];
  }
}

export async function generateJobRecommendations(
  userProfile: any
): Promise<any[]> {
  try {
    const prompt = `Based on this user profile with skills: ${JSON.stringify(userProfile.skills || [])}, experience: ${userProfile.experience || "none"}, and interests: ${userProfile.interests || "general"}, 
    recommend 5 job roles and titles that would be perfect for this person. 
    Return ONLY a JSON array of objects with this exact format: [{"role": "Job Title", "description": "Why this fits", "skills_match": "Which skills match", "salary_range": "Expected range"}]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error("Error generating job recommendations:", error);
    return [];
  }
}

export async function generateProfileImprovementSuggestions(
  userProfile: any
): Promise<string[]> {
  try {
    const prompt = `Analyze this user profile and suggest improvements:
    Name: ${userProfile.name}
    Bio: ${userProfile.bio}
    Skills: ${userProfile.skills?.join(", ") || "None added"}
    Experience: ${userProfile.experience || "Not specified"}
    Projects: ${userProfile.projects || "None"}
    
    Generate 5 specific, actionable suggestions to improve their profile and increase visibility. 
    Return ONLY a JSON array of 5 strings. Example: ["Suggestion 1", "Suggestion 2", ...]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error("Error generating profile suggestions:", error);
    return [];
  }
}

export async function generateEventRecommendations(
  userProfile: any,
  interests: string[]
): Promise<any[]> {
  try {
    const prompt = `Based on a user interested in: ${interests.join(", ")}, with skills: ${userProfile.skills?.join(", ") || "general"}, 
    recommend 5 types of events, workshops, or conferences that would be valuable for their career growth.
    Return ONLY a JSON array of objects with format: [{"event_type": "Type", "description": "Description", "benefits": "Key benefits", "ideal_for": "Who should attend"}]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error("Error generating event recommendations:", error);
    return [];
  }
}

export async function generateProjectIdeas(
  userProfile: any
): Promise<any[]> {
  try {
    const prompt = `Based on this developer's profile with skills: ${userProfile.skills?.join(", ") || "general"}, experience level: ${userProfile.experienceLevel || "intermediate"}, 
    and interests in: ${userProfile.interests?.join(", ") || "web development"},
    suggest 5 innovative project ideas they could build to enhance their portfolio.
    Return ONLY a JSON array of objects with format: [{"title": "Project Name", "description": "What it does", "skills_used": ["skill1", "skill2"], "learning_value": "What they'll learn", "difficulty": "beginner|intermediate|advanced"}]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error("Error generating project ideas:", error);
    return [];
  }
}

export async function analyzeTeamCompatibility(
  userProfile: any,
  otherUsers: any[]
): Promise<any[]> {
  try {
    const prompt = `Analyze team compatibility for a hackathon:
    Team Lead: ${userProfile.name} with skills: ${userProfile.skills?.join(", ")}
    Potential members: ${JSON.stringify(
      otherUsers.map((u) => ({ name: u.name, skills: u.skills }))
    )}
    
    Score each potential member's compatibility with the team lead (1-10) and explain why.
    Return ONLY a JSON array of objects: [{"user_id": "id", "compatibility_score": 8, "reasoning": "Why they fit", "strengths": "What they bring"}]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error("Error analyzing team compatibility:", error);
    return [];
  }
}

export async function improvePostContent(
  postContent: string
): Promise<string> {
  try {
    const prompt = `Improve this LinkedIn-like post for better engagement while keeping the core message. Make it more impactful, professional, and engaging:
    
    Original: "${postContent}"
    
    Return ONLY the improved post text, no explanations or quotes.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim().replace(/^["']|["']$/g, "");
  } catch (error) {
    console.error("Error improving post content:", error);
    return postContent;
  }
}

export async function generateSkillRecommendations(
  currentSkills: string[]
): Promise<string[]> {
  try {
    const prompt = `Based on these current skills: ${currentSkills.join(", ")}, 
    recommend 5 complementary skills that would enhance career prospects and create a well-rounded profile.
    Return ONLY a JSON array of 5 skill names as strings.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error("Error generating skill recommendations:", error);
    return [];
  }
}

export async function generateNetworkingAdvice(
  userProfile: any
): Promise<string> {
  try {
    const prompt = `Provide 1 specific networking advice for someone in ${userProfile.industry || "tech"} industry with ${(userProfile.experience || 0) + " years"} of experience. 
    Make it actionable and specific. Keep it to 2-3 sentences.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Error generating networking advice:", error);
    return "";
  }
}
