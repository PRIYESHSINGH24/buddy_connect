"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Loader, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface AIPostSuggestionsProps {
  userProfile: string;
  recentPosts?: string[];
  onSelectSuggestion: (suggestion: string) => void;
}

export default function AIPostSuggestions({
  userProfile,
  recentPosts = [],
  onSelectSuggestion,
}: AIPostSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const generateSuggestions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/ai/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "post-suggestions",
          userProfile: userProfile,
          recentPosts: recentPosts,
        }),
      });

      const data = await response.json();
      if (data.data && Array.isArray(data.data)) {
        setSuggestions(data.data);
        setShowSuggestions(true);
        toast.success("Post suggestions generated!");
      }
    } catch (error) {
      toast.error("Failed to generate suggestions");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={generateSuggestions}
        disabled={loading}
        className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
      >
        {loading ? (
          <>
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Get AI Post Suggestions
          </>
        )}
      </Button>

      {showSuggestions && suggestions.length > 0 && (
        <div className="space-y-2 bg-linear-to-br from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">
              💡 AI Suggestions
            </span>
            <button
              onClick={generateSuggestions}
              disabled={loading}
              className="text-blue-600 hover:text-blue-700 text-xs"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {suggestions.map((suggestion, idx) => (
              <div
                key={idx}
                className="p-2 bg-white rounded border border-gray-200 hover:border-blue-400 transition-colors cursor-pointer group"
                onClick={() => {
                  onSelectSuggestion(suggestion);
                  setShowSuggestions(false);
                }}
              >
                <p className="text-sm text-gray-700 group-hover:text-blue-600">
                  {suggestion}
                </p>
                <span className="text-xs text-gray-500 group-hover:text-blue-500">
                  Click to use →
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
