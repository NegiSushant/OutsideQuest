"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GeneratedQuest, Mood } from "@/lib/types";
import Loader from "@/components/Loader";

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

function ReflectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const questIdFromUrl = searchParams.get("id");

  const [quest, setQuest] = useState<GeneratedQuest | null>(null);
  const [minutesOutside, setMinutesOutside] = useState<number>(0);
  const [reflection, setReflection] = useState("");
  const [moodBefore, setMoodBefore] = useState<Mood | null>(null);
  const [moodAfter, setMoodAfter] = useState<Mood | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load active / targeted quest + calculate minutes outside
  useEffect(() => {
    const load = async () => {
      try {
        let currentQuest: GeneratedQuest | null = null;

        const endpoint = questIdFromUrl
          ? `/api/latest-quest?id=${encodeURIComponent(questIdFromUrl)}`
          : "/api/latest-quest";

        const res = await fetch(endpoint);
        if (res.ok) {
          currentQuest = await res.json();
        } else {
          const raw = localStorage.getItem("outsidequest_current");
          if (raw) currentQuest = JSON.parse(raw);
        }

        if (!currentQuest) {
          router.replace("/start");
          return;
        }

        setQuest(currentQuest);

        // Pre-fill "Mood before" from original user preference
        if (currentQuest.basedOn?.mood) {
          setMoodBefore(currentQuest.basedOn.mood as Mood);
        }

        // If existing reflection data is already on quest, prefill it
        if (currentQuest.reflection) {
          setReflection(currentQuest.reflection);
        }
        if (currentQuest.moodBefore) {
          setMoodBefore(currentQuest.moodBefore);
        }
        if (currentQuest.moodAfter) {
          setMoodAfter(currentQuest.moodAfter);
        }

        // Calculate minutes outside from startedAt or fallback to planned duration
        const startedAtStr =
          currentQuest.startedAt ||
          localStorage.getItem("outsidequest_started_at");

        if (startedAtStr) {
          const startMs = new Date(startedAtStr).getTime();
          const nowMs = Date.now();
          const mins = Math.max(1, Math.round((nowMs - startMs) / 60000));
          setMinutesOutside(mins);
        } else if (typeof currentQuest.minutesOutside === "number") {
          setMinutesOutside(currentQuest.minutesOutside);
        } else {
          setMinutesOutside(currentQuest.duration);
        }
      } catch (err) {
        console.error("Failed to load quest for reflection:", err);
        router.replace("/start");
      }
    };

    load();
  }, [questIdFromUrl, router]);

  const handleSave = async () => {
    if (!quest || !reflection.trim()) return;

    setIsSaving(true);

    try {
      const startedAt =
        quest.startedAt || localStorage.getItem("outsidequest_started_at");
      const completedAt = new Date().toISOString();

      const payload = {
        questId: quest.id,
        quest,
        reflection: reflection.trim(),
        moodBefore,
        moodAfter,
        minutesOutside,
        completedAt,
        startedAt,
      };

      // Call API to persist completion & reflection into quest-test-logs.json
      const res = await fetch("/api/complete-quest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to save reflection");
      }

      // Clear active quest and timer state in localStorage
      localStorage.removeItem("outsidequest_started_at");
      localStorage.removeItem("outsidequest_active");
      localStorage.removeItem("outsidequest_current");

      setSaved(true);

      // Redirect to /journal after short success state
      setTimeout(() => {
        router.push("/journal");
      }, 1500);
    } catch (err) {
      console.error(err);
      alert("Failed to save reflection. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!quest) {
    return (
      <main className="min-h-screen bg-emerald-50 dark:bg-zinc-950 flex items-center justify-center">
        <Loader />
      </main>
    );
  }

  // Success state
  if (saved) {
    return (
      <main className="min-h-screen bg-linear-to-b from-emerald-50 to-white dark:from-zinc-950 dark:to-zinc-900 flex flex-col items-center justify-center px-6 text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950 rounded-full flex items-center justify-center text-4xl mb-4 border border-emerald-200 dark:border-emerald-800 shadow-lg">
          🌿
        </div>
        <h1 className="text-3xl font-extrabold text-emerald-950 dark:text-zinc-50 mb-2">
          Reflection Saved!
        </h1>
        <p className="text-emerald-700 dark:text-emerald-300 text-sm max-w-sm mb-6">
          You recorded <span className="font-bold">{minutesOutside} minutes</span>{" "}
          outside. Taking you to your history...
        </p>
        <div className="w-8 h-8 rounded-full border-3 border-emerald-500 border-t-transparent animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-linear-to-b from-emerald-50 via-white to-emerald-50/40 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 px-4 py-12 transition-colors duration-200">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-3 border border-emerald-200 dark:border-emerald-800/60">
            🌱 Welcome Back
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-950 dark:text-zinc-50 tracking-tight">
            How was your quest?
          </h1>
          <p className="text-sm text-emerald-700/80 dark:text-zinc-400 mt-2">
            You were outside for approximately{" "}
            <span className="font-bold text-emerald-900 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md">
              {minutesOutside} minutes
            </span>
          </p>
        </div>

        {/* 1. Full Context: User Inputs Used */}
        <section className="bg-white dark:bg-zinc-900 rounded-3xl border border-emerald-100 dark:border-zinc-800 shadow-md p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-50 dark:border-zinc-800/80 pb-3">
            <h2 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>🎯</span> User Preferences Used
            </h2>
            <span className="text-[11px] text-emerald-600/70 dark:text-zinc-500">
              Initial prompt settings
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-emerald-50/60 dark:bg-zinc-800/60 p-3 rounded-2xl border border-emerald-100/60 dark:border-zinc-700/60">
              <span className="block text-emerald-600/80 dark:text-zinc-400 font-medium mb-0.5">
                Available Time
              </span>
              <span className="text-sm font-bold text-emerald-950 dark:text-zinc-100">
                {quest.basedOn?.availableTime || quest.duration} min
              </span>
            </div>

            <div className="bg-emerald-50/60 dark:bg-zinc-800/60 p-3 rounded-2xl border border-emerald-100/60 dark:border-zinc-700/60">
              <span className="block text-emerald-600/80 dark:text-zinc-400 font-medium mb-0.5">
                Target Mood
              </span>
              <span className="text-sm font-bold text-emerald-950 dark:text-zinc-100 capitalize">
                {quest.basedOn?.mood || "N/A"}
              </span>
            </div>

            <div className="bg-emerald-50/60 dark:bg-zinc-800/60 p-3 rounded-2xl border border-emerald-100/60 dark:border-zinc-700/60">
              <span className="block text-emerald-600/80 dark:text-zinc-400 font-medium mb-0.5">
                Environment
              </span>
              <span className="text-sm font-bold text-emerald-950 dark:text-zinc-100 capitalize">
                {quest.basedOn?.environment || "N/A"}
              </span>
            </div>

            <div className="bg-emerald-50/60 dark:bg-zinc-800/60 p-3 rounded-2xl border border-emerald-100/60 dark:border-zinc-700/60">
              <span className="block text-emerald-600/80 dark:text-zinc-400 font-medium mb-0.5">
                Surprise Quest
              </span>
              <span className="text-sm font-bold text-emerald-950 dark:text-zinc-100">
                {quest.basedOn?.isSurprise ? "Yes ✨" : "No"}
              </span>
            </div>
          </div>

          {quest.basedOn?.notes && (
            <div className="bg-emerald-50/40 dark:bg-zinc-800/40 p-3 rounded-2xl border border-emerald-100/60 dark:border-zinc-700/60 text-xs">
              <span className="text-emerald-700 dark:text-zinc-400 font-semibold block mb-0.5">
                User Notes / Restrictions:
              </span>
              <p className="text-emerald-900 dark:text-zinc-200 italic">
                "{quest.basedOn.notes}"
              </p>
            </div>
          )}
        </section>

        {/* 2. Full Context: Model-Generated Quest */}
        <section className="bg-white dark:bg-zinc-900 rounded-3xl border border-emerald-100 dark:border-zinc-800 shadow-md p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-50 dark:border-zinc-800/80 pb-3">
            <h2 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>🗺️</span> Full Model-Generated Quest
            </h2>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              ⏱ {quest.duration} min
            </span>
          </div>

          <div>
            <h3 className="text-xl font-bold text-emerald-950 dark:text-zinc-50">
              {quest.title}
            </h3>
            {quest.description && (
              <p className="text-sm text-emerald-800/80 dark:text-zinc-300 mt-2 leading-relaxed">
                {quest.description}
              </p>
            )}
          </div>

          {quest.tags && quest.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {quest.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-zinc-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium border border-emerald-100 dark:border-zinc-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Complete Tasks List */}
          <div className="pt-2">
            <p className="text-xs font-semibold text-emerald-900 dark:text-zinc-300 uppercase tracking-wide mb-3">
              Tasks Completed ({quest.tasks.length}):
            </p>
            <div className="space-y-2.5">
              {quest.tasks.map((task, idx) => (
                <div
                  key={task.id || idx}
                  className="flex gap-3 bg-emerald-50/40 dark:bg-zinc-800/50 border border-emerald-100/70 dark:border-zinc-800 p-3.5 rounded-2xl"
                >
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    {idx + 1}
                  </span>
                  <span className="text-xs sm:text-sm text-emerald-950 dark:text-zinc-200 leading-relaxed font-medium">
                    {task.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Reflection Form */}
        <section className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-emerald-100 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <h2 className="text-lg font-bold text-emerald-950 dark:text-zinc-50 flex items-center gap-2">
            <span>💭</span> Your Reflection
          </h2>

          {/* Mood Before & Mood After */}
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                  Mood Before Quest (Pre-filled)
                </label>
                {moodBefore && (
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold capitalize">
                    Selected: {moodBefore}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {MOOD_OPTIONS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMoodBefore(m.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${moodBefore === m.id
                      ? "bg-emerald-600 text-white shadow-md scale-105"
                      : "bg-emerald-50/60 dark:bg-zinc-800 text-emerald-900 dark:text-zinc-300 border border-emerald-100 dark:border-zinc-700 hover:border-emerald-300"
                      }`}
                  >
                    <span>{m.emoji}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                  Mood After Quest
                </label>
                {moodAfter && (
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold capitalize">
                    Selected: {moodAfter}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {MOOD_OPTIONS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMoodAfter(m.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${moodAfter === m.id
                      ? "bg-emerald-600 text-white shadow-md scale-105"
                      : "bg-emerald-50/60 dark:bg-zinc-800 text-emerald-900 dark:text-zinc-300 border border-emerald-100 dark:border-zinc-700 hover:border-emerald-300"
                      }`}
                  >
                    <span>{m.emoji}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reflection Textarea */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 mb-2 block">
              What did you notice / feel?
            </label>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="What caught your attention outside? How do your thoughts feel now? A few sentences is plenty..."
              rows={5}
              className="w-full rounded-2xl border border-emerald-200 dark:border-zinc-700 bg-emerald-50/20 dark:bg-zinc-950/60 px-4 py-3.5 text-sm text-emerald-950 dark:text-zinc-100 placeholder:text-emerald-500/50 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition resize-none leading-relaxed"
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleSave}
              disabled={!reflection.trim() || isSaving}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-lg shadow-emerald-900/10 dark:shadow-black/50 transition-all active:scale-[0.98] text-sm sm:text-base flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Saving Reflection...</span>
                </>
              ) : (
                <span>Save Reflection →</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => router.push("/journal")}
              className="w-full py-3 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-white transition"
            >
              Skip for now (Go to Journal)
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function ReflectPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-emerald-50 dark:bg-zinc-950 flex items-center justify-center">
          <Loader />
        </main>
      }
    >
      <ReflectContent />
    </Suspense>
  );
}
