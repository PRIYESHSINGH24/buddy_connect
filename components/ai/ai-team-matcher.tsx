"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Sparkles, Loader, Star } from "lucide-react";
import { toast } from "sonner";

interface AITeamMatcherProps {
  userProfile: any;
  potentialTeamMembers?: any[];
}

export default function AITeamMatcher({
  userProfile,
  potentialTeamMembers = [],
}: AITeamMatcherProps) {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const analyzeTeamCompatibility = async () => {
    if (!potentialTeamMembers.length) {
      toast.error("No team members available to analyze");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/ai/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "team-analysis",
          userProfile: userProfile,
          potentialTeamMembers: potentialTeamMembers.slice(0, 10),
        }),
      });

      const data = await response.json();
      if (data.data) {
        // Sort by compatibility score
        const sorted = (data.data as any[]).sort(
          (a, b) => b.compatibility_score - a.compatibility_score
        );
        setMatches(sorted);
        setOpen(true);
        toast.success("Team compatibility analysis complete!");
      }
    } catch (error) {
      toast.error("Failed to analyze team compatibility");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={analyzeTeamCompatibility}
        disabled={loading || !potentialTeamMembers.length}
        className="bg-linear-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white w-full"
      >
        {loading ? (
          <>
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            Analyzing Teams...
          </>
        ) : (
          <>
            <Users className="w-4 h-4 mr-2" />
            Get AI Team Recommendations
          </>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-600" />
              AI-Powered Team Matching
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {matches.slice(0, 8).map((match, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow border-0">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {match.user_name || `Team Member ${idx + 1}`}
                        </h3>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.round(match.compatibility_score / 2)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {match.reasoning}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {match.strengths
                          ?.split(",")
                          .slice(0, 3)
                          .map((strength: string, i: number) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-xs bg-orange-50 text-orange-700 border-orange-200"
                            >
                              {strength.trim()}
                            </Badge>
                          ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-orange-600">
                        {match.compatibility_score}/10
                      </div>
                      <span className="text-xs text-gray-500">Compatibility</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-orange-50 p-3 rounded-lg text-sm text-gray-700 border border-orange-200">
            🏆 <strong>Pro Tip:</strong> Form teams with high compatibility scores
            for better collaboration and project success!
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
