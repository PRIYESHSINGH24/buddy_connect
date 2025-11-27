"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader } from "lucide-react";
import {
  Sparkles,
  Briefcase,
  Target,
  Lightbulb,
  TrendingUp,
} from "lucide-react";

interface AIDashboardRecommendationsProps {
  userProfile: any;
  userSkills?: string[];
}

export default function AIDashboardRecommendations({
  userProfile,
  userSkills = [],
}: AIDashboardRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "jobs" | "projects" | "skills" | "advice"
  >("jobs");

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);

        // Fetch job recommendations
        const jobRes = await fetch("/api/ai/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "job-recommendations",
            userProfile: userProfile,
          }),
        });
        const jobData = await jobRes.json();

        // Fetch project ideas
        const projectRes = await fetch("/api/ai/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "project-ideas",
            userProfile: userProfile,
          }),
        });
        const projectData = await projectRes.json();

        // Fetch skill recommendations
        const skillRes = await fetch("/api/ai/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "skill-recommendations",
            userProfile: { skills: userSkills },
          }),
        });
        const skillData = await skillRes.json();

        setRecommendations({
          jobs: jobData.data || [],
          projects: projectData.data || [],
          skills: skillData.data || [],
        });
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userProfile, userSkills]);

  if (loading) {
    return (
      <Card className="border-0 shadow-lg bg-linear-to-br from-blue-50 to-purple-50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg">AI Recommendations</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-40">
          <Loader className="w-6 h-6 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
      <CardHeader className="pb-3 bg-linear-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <CardTitle className="text-lg">AI Recommendations</CardTitle>
          </div>
          <Badge variant="secondary" className="bg-white text-purple-600">
            Powered by Gemini
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Tabs */}
        <div className="flex gap-2 mb-4 border-b">
          <button
            onClick={() => setActiveTab("jobs")}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === "jobs"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Briefcase className="w-4 h-4 inline mr-1" />
            Jobs
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === "projects"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Lightbulb className="w-4 h-4 inline mr-1" />
            Projects
          </button>
          <button
            onClick={() => setActiveTab("skills")}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === "skills"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-1" />
            Skills
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3">
          {activeTab === "jobs" && recommendations?.jobs?.length > 0 && (
            <>
              {recommendations.jobs.slice(0, 3).map((job: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {job.role}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {job.description}
                      </p>
                      <div className="mt-2 flex gap-1 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {job.skills_match}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="text-xs bg-green-100 text-green-800"
                        >
                          {job.salary_range}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {activeTab === "projects" && recommendations?.projects?.length > 0 && (
            <>
              {recommendations.projects.slice(0, 3).map((project: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {project.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {project.description}
                      </p>
                      <div className="mt-2 flex gap-1 flex-wrap">
                        {project.skills_used?.slice(0, 2).map((skill: string, i: number) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                        <Badge
                          variant="secondary"
                          className={`text-xs ${
                            project.difficulty === "beginner"
                              ? "bg-green-100 text-green-800"
                              : project.difficulty === "intermediate"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {project.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {activeTab === "skills" && recommendations?.skills?.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {recommendations.skills.slice(0, 4).map((skill: string, idx: number) => (
                <Badge
                  key={idx}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-center py-2 justify-center"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Sparkles className="w-4 h-4 mr-2" />
          Explore More Recommendations
        </Button>
      </CardContent>
    </Card>
  );
}
