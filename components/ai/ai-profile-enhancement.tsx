"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Sparkles, Loader, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface AIProfileEnhancementProps {
  userProfile: any;
  onApplySuggestion?: (suggestion: string) => void;
}

export default function AIProfileEnhancement({
  userProfile,
  onApplySuggestion,
}: AIProfileEnhancementProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [applied, setApplied] = useState<Set<number>>(new Set());

  const generateSuggestions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/ai/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "profile-improvements",
          userProfile: userProfile,
        }),
      });

      const data = await response.json();
      if (data.data && Array.isArray(data.data)) {
        setSuggestions(data.data);
        setOpen(true);
        toast.success("Profile improvement suggestions generated!");
      }
    } catch (error) {
      toast.error("Failed to generate suggestions");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (index: number, suggestion: string) => {
    setApplied((prev) => new Set(prev).add(index));
    onApplySuggestion?.(suggestion);
    toast.success("Suggestion noted! Update your profile accordingly.");
  };

  return (
    <>
      <Button
        onClick={generateSuggestions}
        disabled={loading}
        variant="outline"
        className="border-blue-200 hover:bg-blue-50"
      >
        {loading ? (
          <>
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Enhance Profile with AI
          </>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              AI Profile Enhancement Suggestions
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {suggestions.map((suggestion, idx) => (
              <Card
                key={idx}
                className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-blue-500"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {suggestion}
                    </p>
                    <Badge
                      variant="secondary"
                      className="mt-2 bg-blue-100 text-blue-800"
                    >
                      Improvement #{idx + 1}
                    </Badge>
                  </div>
                  {applied.has(idx) ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleApply(idx, suggestion)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Apply
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <div className="bg-blue-50 p-3 rounded-lg text-sm text-gray-700">
            💡 <strong>Tip:</strong> Implementing these suggestions will help you
            stand out to employers and increase your profile visibility!
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
