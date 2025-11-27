"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Briefcase,
  Users,
  Lightbulb,
  TrendingUp,
  MessageCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI Post Suggestions",
    description: "Get intelligent content ideas tailored to your profile and network",
    color: "from-blue-500 to-purple-500",
  },
  {
    icon: Briefcase,
    title: "Job Recommendations",
    description: "Discover roles that match your skills and career aspirations",
    color: "from-green-500 to-blue-500",
  },
  {
    icon: Lightbulb,
    title: "Project Ideas",
    description: "Build portfolio-worthy projects suggested by AI analysis",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: Users,
    title: "Smart Team Matching",
    description: "Find ideal hackathon teammates with AI compatibility scoring",
    color: "from-red-500 to-pink-500",
  },
  {
    icon: MessageCircle,
    title: "24/7 AI Mentor",
    description: "Chat with your personal career coach anytime, anywhere",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: TrendingUp,
    title: "Profile Enhancement",
    description: "Get actionable suggestions to improve your visibility and impact",
    color: "from-indigo-500 to-blue-500",
  },
];

export default function AIShowcase() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />

      {/* Hero Section */}
      <div className="relative px-4 py-20 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-3xl" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-sm font-medium text-white">
              Powered by Google Gemini AI
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
            Meet Your AI Career{" "}
            <span className="bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Companion
            </span>
          </h1>

          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Buddy Connect now includes cutting-edge AI that analyzes your profile,
            recommends opportunities, and helps you succeed in your career journey.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              onClick={() => router.push(user ? "/dashboard" : "/login")}
              className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg"
            >
              {user ? "Go to Dashboard" : "Get Started"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="relative px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-16 text-center">
            Powerful AI Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={idx}
                  className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/5 backdrop-blur-sm hover:bg-white/10 overflow-hidden"
                >
                  <div
                    className={`h-1 bg-linear-to-r ${feature.color}`}
                  />
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg bg-linear-to-br ${feature.color}`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-white text-lg">
                        {feature.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="relative px-4 py-20 bg-white/5 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">
            Why Choose AI Assistant?
          </h2>

          <div className="space-y-4">
            {[
              "Personalized recommendations based on your unique skills and interests",
              "Save time with AI-generated content suggestions for posts and profiles",
              "Discover hidden opportunities that match your career goals",
              "Build a stronger network with smart team matching",
              "Improve your visibility with data-driven profile enhancements",
              "24/7 mentorship and career guidance at your fingertips",
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-white text-lg">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Transform Your Career?
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            Start using AI-powered recommendations to land your dream job and build
            amazing projects.
          </p>
          <Button
            onClick={() => router.push(user ? "/dashboard" : "/signup")}
            className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg"
          >
            Start Free Today
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
