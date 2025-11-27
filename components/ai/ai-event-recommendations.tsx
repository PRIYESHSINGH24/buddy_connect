"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Sparkles, Loader } from "lucide-react";
import { toast } from "sonner";

interface AIEventRecommendationsProps {
  userProfile: any;
  interests?: string[];
}

export default function AIEventRecommendations({
  userProfile,
  interests = [],
}: AIEventRecommendationsProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [shown, setShown] = useState(false);

  const generateRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/ai/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "event-recommendations",
          userProfile: userProfile,
          interests: interests,
        }),
      });

      const data = await response.json();
      if (data.data) {
        setEvents(data.data);
        setShown(true);
        toast.success("Event recommendations generated!");
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
        className="bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white w-full"
      >
        {loading ? (
          <>
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            Finding Events...
          </>
        ) : (
          <>
            <CalendarDays className="w-4 h-4 mr-2" />
            Discover Events for You
          </>
        )}
      </Button>
    );
  }

  return (
    <div className="space-y-3">
      {events.slice(0, 4).map((event, idx) => (
        <Card key={idx} className="hover:shadow-lg transition-shadow border-0">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-purple-600" />
                  {event.event_type}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className="text-xs bg-purple-50 text-purple-700 border-purple-200"
                  >
                    {event.benefits}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs bg-pink-50 text-pink-700 border-pink-200"
                  >
                    {event.ideal_for}
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
        className="w-full text-purple-600 border-purple-200 hover:bg-purple-50"
      >
        Hide Events
      </Button>
    </div>
  );
}
