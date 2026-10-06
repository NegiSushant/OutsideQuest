"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Mood = "relax" | "explore" | "move" | "create" | "nature";
type Environment = "urban" | "park" | "mixed";

const TIME_OPTIONS = [
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "45 min", value: 45 },
  { label: "60 min", value: 60 },
  { label: "2 hours", value: 120 },
];

const MOOD_OPTIONS: { id: Mood; label: string; emoji: string }[] = [
  { id: "relax", label: "Relax", emoji: "😌" },
  { id: "explore", label: "Explore", emoji: "🧭" },
  { id: "move", label: "Move", emoji: "🏃" },
  { id: "create", label: "Create", emoji: "📸" },
  { id: "nature", label: "Nature", emoji: "🌿" },
];

const ENVIRONMENT_OPTIONS: { id: Environment; label: string }[] = [
  { id: "urban", label: "Urban" },
  { id: "park", label: "Park" },
  { id: "mixed", label: "Mixed" },
];

export default function Home() {
  const router = useRouter();

  const [time, setTime] = useState<number>(30);
  const [mood, setMood] = useState<Mood>("nature");
  const [environment, setEnvironment] = useState<Environment>("mixed");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = (isSurprise = false) => {
    setIsGenerating(true);

    // Store preferences so the generating / quest pages can read them
    const preferences = {
      time_minutes: isSurprise
        ? TIME_OPTIONS[Math.floor(Math.random() * TIME_OPTIONS.length)].value
        : time,
      mood: isSurprise
        ? MOOD_OPTIONS[Math.floor(Math.random() * MOOD_OPTIONS.length)].id
        : mood,
      environment: isSurprise
        ? ENVIRONMENT_OPTIONS[
            Math.floor(Math.random() * ENVIRONMENT_OPTIONS.length)
          ].id
        : environment,
      isSurprise,
    };

    localStorage.setItem(
      "outsidequest_preferences",
      JSON.stringify(preferences),
    );

    // Navigate to generating page
    router.push("/generating");
  };

  return (
    <main className="min-h-screen bg-linear-to-b from-emerald-50 to-white flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-emerald-900 mb-2">
            OutsideQuest
          </h1>
          <p className="text-emerald-700/80 text-lg">
            Less scrolling. More living.
          </p>
        </div>

        {/* Time Selector */}
        <section className="mb-8">
          <h2 className="text-sm font-medium text-emerald-800 mb-3 uppercase tracking-wide">
            How much time do you have?
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {TIME_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setTime(option.value)}
                className={`py-3 px-2 rounded-xl text-sm font-medium transition-all ${
                  time === option.value
                    ? "bg-emerald-600 text-white shadow-md scale-105"
                    : "bg-white text-emerald-800 border border-emerald-200 hover:border-emerald-400"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        {/* Mood Selector */}
        <section className="mb-8">
          <h2 className="text-sm font-medium text-emerald-800 mb-3 uppercase tracking-wide">
            What are you in the mood for?
          </h2>
          <div className="grid grid-cols-5 gap-2">
            {MOOD_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => setMood(option.id)}
                className={`flex flex-col items-center py-3 rounded-xl transition-all ${
                  mood === option.id
                    ? "bg-emerald-600 text-white shadow-md scale-105"
                    : "bg-white text-emerald-800 border border-emerald-200 hover:border-emerald-400"
                }`}
              >
                <span className="text-2xl mb-1">{option.emoji}</span>
                <span className="text-xs font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Environment Selector (Optional) */}
        <section className="mb-10">
          <h2 className="text-sm font-medium text-emerald-800 mb-3 uppercase tracking-wide">
            Environment
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {ENVIRONMENT_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => setEnvironment(option.id)}
                className={`py-3 rounded-xl text-sm font-medium transition-all ${
                  environment === option.id
                    ? "bg-emerald-600 text-white shadow-md"
                    : "bg-white text-emerald-800 border border-emerald-200 hover:border-emerald-400"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => handleGenerate(false)}
            disabled={isGenerating}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-60"
          >
            {isGenerating ? "Creating your quest..." : "Generate OutsideQuest"}
          </button>

          <button
            onClick={() => handleGenerate(true)}
            disabled={isGenerating}
            className="w-full py-3.5 bg-white border-2 border-emerald-200 hover:border-emerald-400 text-emerald-800 font-medium rounded-2xl transition-all active:scale-[0.98] disabled:opacity-60"
          >
            🎲 Surprise Me
          </button>
        </div>

        {/* Tiny footer note */}
        <p className="text-center text-xs text-emerald-600/70 mt-8">
          Powered by local open-weight AI · Your data never leaves the device
        </p>
      </div>
    </main>
  );
}
