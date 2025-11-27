import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.AI_GATEWAY_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Career-specific analysis using AI
export async function analyzeCareerGrowth(userProfile: any): Promise<any> {
  try {
    const prompt = `Analyze this professional's career trajectory and provide insights:
    Current role: ${userProfile.currentRole || "Not specified"}
    Experience: ${userProfile.experience || "0"} years
    Skills: ${userProfile.skills?.join(", ") || "None"}
    Previous roles: ${userProfile.previousRoles?.join(", ") || "First role"}
    
    Provide a structured analysis with: current level assessment, growth trajectory, strengths, areas for improvement, and next career steps.
    Return as JSON with keys: currentLevel, trajectory, strengths[], areasForImprovement[], nextSteps[]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error("Error analyzing career growth:", error);
    return null;
  }
}

// Generate networking advice
export async function generateNetworkingStrategy(
  userProfile: any,
  goals: string[]
): Promise<string> {
  try {
    const prompt = `Create a personalized networking strategy for someone with this profile:
    Industry: ${userProfile.industry || "Tech"}
    Experience level: ${userProfile.experienceLevel || "Mid-level"}
    Goals: ${goals.join(", ")}
    Current network size: ${userProfile.networkSize || "50-100"}
    
    Provide 5 specific, actionable networking strategies that align with their career goals.
    Format as numbered list with explanations.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Error generating networking strategy:", error);
    return "";
  }
}

// Skill gap analysis
export async function analyzeSkillGaps(
  currentSkills: string[],
  targetRole: string
): Promise<any> {
  try {
    const prompt = `Compare skill sets for career transition:
    Current skills: ${currentSkills.join(", ")}
    Target role: ${targetRole}
    
    Identify: gap analysis with priority levels, skill learning paths, estimated time to proficiency, resources to learn, and quick wins.
    Return as JSON with keys: critical[], important[], nice_to_have[], learning_paths[], timeline`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error("Error analyzing skill gaps:", error);
    return null;
  }
}

// Interview preparation
export async function generateInterviewPrep(
  position: string,
  company: string
): Promise<any> {
  try {
    const prompt = `Prepare interview guidance for a position:
    Position: ${position}
    Company: ${company}
    
    Generate comprehensive interview preparation including:
    - Common interview questions
    - How to answer behavior questions (STAR method)
    - Company-specific talking points
    - Technical topics to review
    - Questions to ask interviewer
    
    Format as JSON with sections: behavioral_questions[], technical_topics[], company_insights[], questions_to_ask[]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error("Error generating interview prep:", error);
    return null;
  }
}

// LinkedIn profile optimization
export async function optimizeProfileSummary(
  bio: string,
  targetRole: string,
  skills: string[]
): Promise<string> {
  try {
    const prompt = `Optimize a LinkedIn/professional profile summary to highlight expertise:
    Current bio: "${bio}"
    Target role: ${targetRole}
    Key skills: ${skills.join(", ")}
    
    Create a compelling, professional summary that:
    - Highlights relevant achievements
    - Emphasizes transferable skills
    - Positions for target role
    - Uses industry keywords
    - Is 3-4 sentences max
    
    Return ONLY the optimized bio text, no quotes or explanations.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim().replace(/^["']|["']$/g, "");
  } catch (error) {
    console.error("Error optimizing profile summary:", error);
    return bio;
  }
}

// Remote work suitability assessment
export async function assessRemoteWorkSuitability(
  userProfile: any
): Promise<any> {
  try {
    const prompt = `Assess remote work suitability for this professional:
    Role: ${userProfile.currentRole}
    Experience: ${userProfile.experience} years
    Skills: ${userProfile.skills?.join(", ")}
    Communication style: ${userProfile.communicationStyle || "Unknown"}
    
    Provide: suitability score (1-10), why they'd excel remotely, potential challenges, 
    recommendations to improve remote work readiness.
    Return as JSON: {score, strengths[], challenges[], recommendations[]}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error("Error assessing remote work suitability:", error);
    return null;
  }
}

// Salary negotiation guidance
export async function generateSalaryNegotiationGuide(
  position: string,
  location: string,
  experience: number,
  currentSalary?: number
): Promise<string> {
  try {
    const prompt = `Generate salary negotiation guidance:
    Position: ${position}
    Location: ${location}
    Experience: ${experience} years
    ${currentSalary ? `Current salary: ${currentSalary}` : ""}
    
    Provide: market range for this role/location, negotiation strategies, 
    what to discuss/avoid, timing, and how to handle counter-offers.
    Keep it practical and actionable.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Error generating salary guidance:", error);
    return "";
  }
}

// Mentor recommendation
export async function recommendMentors(
  userProfile: any,
  careerGoals: string[]
): Promise<any> {
  try {
    const prompt = `Suggest ideal mentor profiles for this person's growth:
    Current role: ${userProfile.currentRole}
    Career goals: ${careerGoals.join(", ")}
    Industry: ${userProfile.industry}
    Experience level: ${userProfile.experienceLevel}
    
    Recommend: mentor types to seek, key skills they should have, what to learn from them,
    where to find them (communities, platforms, networks).
    Return as JSON: {mentor_profiles[], where_to_find[], conversation_starters[]}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error("Error recommending mentors:", error);
    return null;
  }
}

// Post engagement optimization
export async function optimizePostForEngagement(
  postContent: string,
  audience: string
): Promise<any> {
  try {
    const prompt = `Analyze and optimize a LinkedIn post for better engagement:
    Post: "${postContent}"
    Target audience: ${audience}
    
    Provide: current sentiment/tone, suggested improvements, 
    optimal hashtags, call-to-action suggestions, best time to post.
    Return as JSON: {suggestions[], hashtags[], cta[], posting_time, engagement_score}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error("Error optimizing post:", error);
    return null;
  }
}
