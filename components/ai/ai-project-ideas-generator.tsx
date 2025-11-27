"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles, Loader, Code, Github } from "lucide-react";
import { toast } from "sonner";

export default function AIProjectIdeasGenerator() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const user = await response.json();
        setUserProfile(user);
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  const generateProjectIdeas = async () => {
    if (!userProfile) {
      toast.error("Please log in to generate project ideas");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/ai/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "project-ideas",
          userProfile: userProfile,
        }),
      });

      const data = await response.json();
      if (data.data) {
        setProjects(data.data);
        setOpen(true);
        toast.success("Project ideas generated!");
      }
    } catch (error) {
      toast.error("Failed to generate project ideas");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={generateProjectIdeas}
        disabled={loading}
        className="bg-linear-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
      >
        {loading ? (
          <>
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            Generating Ideas...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Generate AI Project Ideas
          </>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code className="w-5 h-5 text-green-600" />
              AI-Generated Project Ideas
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project, idx) => (
              <Card
                key={idx}
                className="hover:shadow-lg transition-shadow cursor-pointer border-0"
                onClick={() => setSelectedProject(project)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Code className="w-4 h-4 text-green-600" />
                    {project.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600">{project.description}</p>
                  <div className="flex gap-2 flex-wrap">
                    {project.skills_used?.slice(0, 3).map((skill: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge
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
                    <Badge variant="secondary" className="text-xs">
                      💡 {project.learning_value?.split(" ").slice(0, 3).join(" ")}...
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedProject && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">
                📚 Learning Value
              </h3>
              <p className="text-sm text-green-800">{selectedProject.learning_value}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
