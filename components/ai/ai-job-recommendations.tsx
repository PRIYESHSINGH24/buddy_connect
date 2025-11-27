"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Sparkles, Loader } from "lucide-react";
import { toast } from "sonner";

interface AIJobRecommendationsProps {
  userProfile: any;
}

export default function AIJobRecommendations({
  userProfile,
}: AIJobRecommendationsProps) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [shown, setShown] = useState(false);

  const generateRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/ai/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "job-recommendations",
          userProfile: userProfile,
        }),
      });

      const data = await response.json();
      if (data.data) {
        setJobs(data.data);
        setShown(true);
        toast.success("Job recommendations generated!");
      }
    } catch (error) {
      toast.error("Failed to generate recommendations");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!shown) {
    return (
      <Button
        onClick={generateRecommendations}
        disabled={loading}
        className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white w-full"
      >
        {loading ? (
          <>
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            Analyzing Profile...
          </>
        ) : (
          <>
            <Briefcase className="w-4 h-4 mr-2" />
            Get AI Job Recommendations
          </>
        )}
      </Button>
    );
  }

  return (
    <div className="space-y-3">
      {jobs.slice(0, 5).map((job, idx) => (
        <Card key={idx} className="hover:shadow-lg transition-shadow border-0">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  {job.role}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{job.description}</p>
                <div className="flex gap-2 mt-3 flex-wrap">
                  <Badge
                    variant="outline"
                    className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                  >
                    {job.skills_match}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs bg-green-50 text-green-700 border-green-200"
                  >
                    {job.salary_range}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <Button
        variant="outline"
        onClick={() => setShown(false)}
        className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
      >
        Hide Recommendations
      </Button>
    </div>
  );
}
