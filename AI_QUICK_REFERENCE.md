# 🎯 AI FEATURES - QUICK REFERENCE

## File Locations

### Components
```
components/ai/
├── ai-chat-assistant.tsx           (24/7 Mentor)
├── ai-dashboard-recommendations.tsx (Dashboard Card)
├── ai-event-recommendations.tsx     (Event Suggestions)
├── ai-job-recommendations.tsx       (Job Finder)
├── ai-post-suggestions.tsx          (Post Ideas)
├── ai-profile-enhancement.tsx       (Profile Tips)
├── ai-project-ideas-generator.tsx   (Portfolio Ideas)
└── ai-team-matcher.tsx              (Team Analysis)
```

### Utilities
```
lib/
├── ai-utils.ts          (Core AI functions)
└── ai-advanced-utils.ts (Advanced features)
```

### API
```
app/api/ai/
└── recommendations/route.ts
```

### Pages
```
app/ai/page.tsx → AI Showcase Page
```

### Documentation
```
ROOT/
├── AI_FEATURES.md                  (Feature Details)
├── AI_PRESENTATION_GUIDE.md        (Demo Guide)
├── AI_INTEGRATION_COMPLETE.md      (Summary)
└── AI_QUICK_REFERENCE.md           (This File)
```

---

## 🚀 Quick Setup

1. **Add API Key to .env**
   ```
   AI_GATEWAY_API_KEY=your_key_here
   ```

2. **Restart Dev Server**
   ```
   pnpm dev
   ```

3. **Test Features**
   - Visit `/ai` to see showcase
   - Go to `/dashboard`
   - Click AI buttons
   - Chat with assistant

---

## 💡 Feature Quick Links

| Feature | Component | Where to Use |
|---------|-----------|--------------|
| **Jobs** | `ai-job-recommendations.tsx` | Jobs Page |
| **Projects** | `ai-project-ideas-generator.tsx` | Profile |
| **Posts** | `ai-post-suggestions.tsx` | Feed |
| **Profile** | `ai-profile-enhancement.tsx` | Profile |
| **Events** | `ai-event-recommendations.tsx` | Events |
| **Teams** | `ai-team-matcher.tsx` | Hackathon |
| **Chat** | `ai-chat-assistant.tsx` | Global |
| **Dashboard** | `ai-dashboard-recommendations.tsx` | Dashboard |

---

## 🎬 Demo Script (Quick Version)

```
"Let me show you 8 AI features in Buddy Connect.

1. First, here's our AI showcase page at /ai
   - Beautiful landing page with all features

2. Now on the dashboard, the AI recommendations card
   - Shows jobs, projects, and skills tabs
   - Real-time personalization

3. Our AI chat assistant is here (show floating widget)
   - Available 24/7 on every page

4. On the profile page - AI suggests improvements
   - Actionable tips to boost visibility

5. In the feed - AI suggests engaging posts
   - Personalized based on your network

6. In the hackathon section - AI finds compatible teammates
   - Scores compatibility 1-10

7. Event recommendations - AI suggests workshops
   - Based on your career goals

8. Project ideas - Portfolio projects AI thinks you should build
   - Tailored to skill level

All powered by Google Gemini Pro. Questions?"
```

---

## 📊 API Actions

```bash
# Post Suggestions
{
  "action": "post-suggestions",
  "userProfile": "bio text",
  "recentPosts": ["post1", "post2"]
}

# Job Recommendations
{
  "action": "job-recommendations",
  "userProfile": { "skills": [], "experience": "2 years" }
}

# Profile Improvements
{
  "action": "profile-improvements",
  "userProfile": { "name": "John", "bio": "..." }
}

# Event Recommendations
{
  "action": "event-recommendations",
  "userProfile": { "skills": [] },
  "interests": ["AI", "Web Dev"]
}

# Project Ideas
{
  "action": "project-ideas",
  "userProfile": { "skills": [], "experienceLevel": "intermediate" }
}

# Team Analysis
{
  "action": "team-analysis",
  "userProfile": { "name": "User" },
  "potentialTeamMembers": [...]
}

# Improve Post
{
  "action": "improve-post",
  "postContent": "..."
}

# Skill Recommendations
{
  "action": "skill-recommendations",
  "userProfile": { "skills": [] }
}
```

---

## 🎨 Styling Notes

All components use:
- `from-blue-600 to-purple-600` gradients (primary)
- `from-green-600 to-blue-600` (alt)
- `from-purple-600 to-pink-600` (accent)
- Lucide React icons
- Radix UI components
- Tailwind CSS classes

---

## 🔧 Troubleshooting

| Issue | Fix |
|-------|-----|
| API Key Error | Check .env file |
| Chat Not Working | Verify browser API key access |
| Slow Loading | First call takes 2-3s, normal |
| No Results | Complete profile for better AI |
| Styling Wrong | Check Tailwind is running |

---

## 📱 Integration Examples

### Add to Dashboard
```tsx
import AIDashboardRecommendations from "@/components/ai/ai-dashboard-recommendations";

<AIDashboardRecommendations 
  userProfile={user}
  userSkills={user.skills}
/>
```

### Add to Profile
```tsx
import AIProfileEnhancement from "@/components/ai/ai-profile-enhancement";

<AIProfileEnhancement userProfile={user} />
```

### Add to Feed
```tsx
import AIPostSuggestions from "@/components/ai/ai-post-suggestions";

<AIPostSuggestions 
  userProfile={user.bio}
  onSelectSuggestion={handleSelect}
/>
```

---

## ✅ Pre-Presentation Checklist

- [ ] API key set in .env
- [ ] Server running
- [ ] `/ai` page loads
- [ ] Dashboard AI card shows
- [ ] Chat widget appears
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Toast notifications work

---

## 🎉 Launch!

Your AI integration is complete and production-ready.

**Features**: 8  
**Components**: 8  
**Utility Functions**: 15+  
**Documentation**: 3 files  
**Status**: ✅ Ready  

Good luck with your presentation! 🚀

---

**Questions About Setup?**
Check: `AI_FEATURES.md` for details  
Check: `AI_PRESENTATION_GUIDE.md` for demo tips  
Check: `AI_INTEGRATION_COMPLETE.md` for overview
