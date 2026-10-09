"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mood,
  Environment,
  UserPreferences,
  GeneratedQuest,
} from "@/lib/types";
import QuestGeneratingView from "@/components/QuestGeneratingView";

const TIME_OPTIONS = [
  { label: "15m", value: 15 },
  { label: "30m", value: 30 },
  { label: "45m", value: 45 },
  { label: "60m", value: 60 },
  { label: "2 hrs", value: 120 },
];

const MOOD_OPTIONS: { id: Mood; label: string; emoji: string }[] = [
  { id: "relax", label: "Relax", emoji: "😌" },
  { id: "explore", label: "Explore", emoji: "🧭" },
  { id: "calm", label: "Calm", emoji: "🧘" },
  { id: "nature", label: "Nature", emoji: "🌿" },
  { id: "move", label: "Move", emoji: "🏃" },
  { id: "create", label: "Create", emoji: "📸" },
  { id: "curious", label: "Curious", emoji: "🧐" },
  { id: "adventurous", label: "Adventurous", emoji: "🧗" },
  { id: "reflective", label: "Reflective", emoji: "💭" },
  { id: "anxious", label: "Anxious", emoji: "😰" },
  { id: "bored", label: "Bored", emoji: "🥱" },
];

const ENVIRONMENT_OPTIONS: { id: Environment; label: string; emoji: string }[] =
  [
    { id: "outdoors", label: "Outdoors", emoji: "🏞️" },
    { id: "park", label: "Park", emoji: "🌲" },
    { id: "urban", label: "City / Urban", emoji: "🏙️" },
    { id: "home", label: "Home / Yard", emoji: "🏡" },
    { id: "nature", label: "Nature", emoji: "🌿" },
    { id: "quiet-spot", label: "Quiet Spot", emoji: "🤫" },
    { id: "mixed", label: "Mixed", emoji: "🗺️" },
    { id: "any", label: "Anywhere", emoji: "🌐" },
  ];

export default function StartQuestPage() {
  const router = useRouter();

  // Selection states (presets vs custom)
  const [selectedTimePreset, setSelectedTimePreset] = useState<
    number | "custom"
  >(30);
  const [customTime, setCustomTime] = useState<string>("");
  const [selectedMoodPreset, setSelectedMoodPreset] = useState<Mood | "custom">(
    "nature",
  );
  const [customMood, setCustomMood] = useState<string>("");
  const [selectedEnvPreset, setSelectedEnvPreset] = useState<
    Environment | "custom"
  >("mixed");
  const [customEnv, setCustomEnv] = useState<string>("");
  const [optionalNotes, setOptionalNotes] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState("Reading your preferences...");
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (isSurprise = false) => {
    setIsGenerating(true);
    setError(null);
    setStatus("Reading your preferences...");

    let finalTime = 30;
    if (isSurprise) {
      finalTime =
        TIME_OPTIONS[Math.floor(Math.random() * TIME_OPTIONS.length)].value;
    } else if (selectedTimePreset === "custom") {
      finalTime = parseInt(customTime, 10) > 0 ? parseInt(customTime, 10) : 30;
    } else {
      finalTime = selectedTimePreset;
    }

    let finalMood: Mood = "nature";
    let customMoodNote = "";
    if (isSurprise) {
      finalMood =
        MOOD_OPTIONS[Math.floor(Math.random() * MOOD_OPTIONS.length)].id;
    } else if (selectedMoodPreset === "custom") {
      finalMood = "curious";
      customMoodNote = customMood ? `Custom Mood/Vibe: ${customMood}.` : "";
    } else {
      finalMood = selectedMoodPreset;
    }

    let finalEnv: Environment = "mixed";
    let customEnvNote = "";
    if (isSurprise) {
      finalEnv =
        ENVIRONMENT_OPTIONS[
          Math.floor(Math.random() * ENVIRONMENT_OPTIONS.length)
        ].id;
    } else if (selectedEnvPreset === "custom") {
      finalEnv = "mixed";
      customEnvNote = customEnv ? `Custom Setting/Location: ${customEnv}.` : "";
    } else {
      finalEnv = selectedEnvPreset;
    }

    const aggregatedNotes = [customMoodNote, customEnvNote, optionalNotes]
      .filter(Boolean)
      .join(" ");

    const preferences: UserPreferences = {
      availableTime: finalTime,
      mood: finalMood,
      environment: finalEnv,
      isSurprise,
      notes: aggregatedNotes || undefined,
    };

    try {
      setStatus("Synthesizing your outdoor quest...");
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error("Failed to generate quest");
      }

      const quest: GeneratedQuest = await response.json();

      setStatus("Quest ready! Heading out...");
      setTimeout(() => {
        router.push("/quest");
      }, 700);
    } catch (err) {
      console.error(err);
      setError(
        "Could not generate quest. Verify that your model endpoint operational.",
      );
    }
  };

  return (
    <>
      <main className="min-h-screen bg-linear-to-b from-emerald-50/70 via-white to-emerald-50/50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 px-4 py-12 flex flex-col items-center justify-center transition-colors duration-300">
        <div className="w-full max-w-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-3 border border-emerald-200 dark:border-emerald-800/60">
              ⚡ Local AI Adventure Engine
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-950 dark:text-zinc-50 tracking-tight">
              Craft Your Quest
            </h1>
            <p className="text-sm text-emerald-700/80 dark:text-zinc-400 mt-1.5">
              Fine-tune the parameters or type your own custom context
            </p>
          </div>

          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-emerald-100 dark:border-zinc-800/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-emerald-950/5 dark:shadow-black/40 space-y-7">
            {/* 1. Time Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                  1. How much time do you have?
                </label>
                {selectedTimePreset === "custom" && (
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    Custom input active
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {TIME_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedTimePreset(opt.value)}
                    className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      selectedTimePreset === opt.value
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20"
                        : "bg-emerald-50/50 dark:bg-zinc-800/70 border-emerald-100 dark:border-zinc-700 text-emerald-900 dark:text-zinc-200 hover:border-emerald-300 dark:hover:border-zinc-600"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSelectedTimePreset("custom")}
                  className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    selectedTimePreset === "custom"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20"
                      : "bg-emerald-50/50 dark:bg-zinc-800/70 border-emerald-100 dark:border-zinc-700 text-emerald-900 dark:text-zinc-200 hover:border-emerald-300 dark:hover:border-zinc-600"
                  }`}
                >
                  Custom
                </button>
              </div>

              {selectedTimePreset === "custom" && (
                <div className="mt-2.5">
                  <input
                    type="number"
                    min="5"
                    max="480"
                    placeholder="Enter minutes (e.g. 20, 90)"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-emerald-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}
            </div>

            {/* 2. Mood Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                  2. What vibe are you feeling?
                </label>
                {selectedMoodPreset === "custom" && (
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    Custom vibe active
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {MOOD_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedMoodPreset(opt.id)}
                    className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border transition-all ${
                      selectedMoodPreset === opt.id
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20"
                        : "bg-emerald-50/50 dark:bg-zinc-800/70 border-emerald-100 dark:border-zinc-700 text-emerald-900 dark:text-zinc-200 hover:border-emerald-300 dark:hover:border-zinc-600"
                    }`}
                  >
                    <span className="text-lg leading-none mb-1">
                      {opt.emoji}
                    </span>
                    <span className="text-[11px] font-medium">{opt.label}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSelectedMoodPreset("custom")}
                  className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border transition-all ${
                    selectedMoodPreset === "custom"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20"
                      : "bg-emerald-50/50 dark:bg-zinc-800/70 border-emerald-100 dark:border-zinc-700 text-emerald-900 dark:text-zinc-200 hover:border-emerald-300 dark:hover:border-zinc-600"
                  }`}
                >
                  <span className="text-lg leading-none mb-1">✨</span>
                  <span className="text-[11px] font-medium">Custom</span>
                </button>
              </div>

              {selectedMoodPreset === "custom" && (
                <div className="mt-2.5">
                  <input
                    type="text"
                    placeholder="e.g. melancholic, hyper-focused, nostalgic, restless"
                    value={customMood}
                    onChange={(e) => setCustomMood(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-emerald-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}
            </div>

            {/* 3. Environment Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                  3. Where are you stepping out?
                </label>
                {selectedEnvPreset === "custom" && (
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    Custom spot active
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ENVIRONMENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedEnvPreset(opt.id)}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      selectedEnvPreset === opt.id
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20"
                        : "bg-emerald-50/50 dark:bg-zinc-800/70 border-emerald-100 dark:border-zinc-700 text-emerald-900 dark:text-zinc-200 hover:border-emerald-300 dark:hover:border-zinc-600"
                    }`}
                  >
                    <span>{opt.emoji}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSelectedEnvPreset("custom")}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    selectedEnvPreset === "custom"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20"
                      : "bg-emerald-50/50 dark:bg-zinc-800/70 border-emerald-100 dark:border-zinc-700 text-emerald-900 dark:text-zinc-200 hover:border-emerald-300 dark:hover:border-zinc-600"
                  }`}
                >
                  <span>📍</span>
                  <span>Custom</span>
                </button>
              </div>

              {selectedEnvPreset === "custom" && (
                <div className="mt-2.5">
                  <input
                    type="text"
                    placeholder="e.g. beach promenade, rooftop garden, rain-soaked alley"
                    value={customEnv}
                    onChange={(e) => setCustomEnv(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-emerald-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}
            </div>

            {/* 4. Optional Special Directives */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 mb-2">
                Special Directives (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Keep it quiet, I have bad knees, or make it photo-centric..."
                value={optionalNotes}
                onChange={(e) => setOptionalNotes(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-emerald-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-3">
              <button
                type="button"
                onClick={() => handleGenerate(false)}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-700/20 transition-all active:scale-[0.98] text-sm sm:text-base flex items-center justify-center gap-2"
              >
                <span>Generate OutsideQuest</span>
                <span aria-hidden="true">&rarr;</span>
              </button>

              <button
                type="button"
                onClick={() => handleGenerate(true)}
                className="w-full py-3.5 bg-emerald-50/70 dark:bg-zinc-800/80 border border-emerald-200 dark:border-zinc-700 hover:border-emerald-400 dark:hover:border-zinc-500 text-emerald-800 dark:text-zinc-200 font-semibold rounded-2xl transition-all active:scale-[0.98] text-xs sm:text-sm flex items-center justify-center gap-1.5"
              >
                <span>🎲</span>
                <span>Surprise Me Completely</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {(isGenerating || error) && (
        <QuestGeneratingView
          status={status}
          error={error}
          onRetry={() => {
            setError(null);
            setIsGenerating(false);
          }}
          onClose={() => {
            setError(null);
            setIsGenerating(false);
          }}
        />
      )}
    </>
  );
}
