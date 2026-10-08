"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import { GeneratedQuest } from "@/lib/types";
import StartQuestModal from "@/components/StartQuest";

export default function QuestPage() {
  const router = useRouter();
  const [quest, setQuest] = useState<GeneratedQuest | null>(null);
  const [loading, setLoading] = useState(true);
  const [showStartModal, setShowStartModal] = useState(false);
  const [limitWarning, setLimitWarning] = useState<string | null>(null);

  useEffect(() => {
    const loadQuest = async () => {
      try {
        const res = await fetch("/api/latest-quest");

        if (res.ok) {
          const data: GeneratedQuest = await res.json();
          setQuest(data);
          return;
        }

        router.replace("/start");
      } catch (err) {
        console.error(err);
        router.replace("/start");
      } finally {
        setLoading(false);
      }
    };

    loadQuest();
  }, [router]);

  if (loading) return <Loader />;
  if (!quest) return null;

  const status = quest.status || "not_started";

  const handleStartOrResume = async () => {
    setLimitWarning(null);

    if (status === "completed") {
      router.push(`/reflect?id=${quest.id}`);
      return;
    }

    try {
      const res = await fetch("/api/generate");
      if (res.ok) {
        const allQuests: GeneratedQuest[] = await res.json();
        const ongoingCount = allQuests.filter((q) => q.status === "ongoing").length;
        if (status !== "ongoing" && ongoingCount >= 2) {
          setLimitWarning(
            "You already have 2 quests in progress. Finish or complete one before starting another."
          );
          return;
        }
      }
    } catch (err) {
      console.error("Failed to check ongoing quests count:", err);
    }

    setShowStartModal(true);
  };

  // Button label + action based on status
  const getButtonConfig = () => {
    switch (status) {
      case "ongoing":
        return {
          label: "▶ Resume Quest",
          subtext: "Your quest is still running. Continue where you left off.",
          action: handleStartOrResume,
        };
      case "completed":
        return {
          label: "📝 Reflect on Quest",
          subtext: "Time’s up. Capture what you experienced.",
          action: () => router.push(`/reflect?id=${quest.id}`),
        };
      default: // not_started
        return {
          label: "🌱 START QUEST",
          subtext: "After you press start, put your phone away and go outside.",
          action: handleStartOrResume,
        };
    }
  };

  const button = getButtonConfig();

  return (
    <>
      <main className="min-h-screen bg-linear-to-b from-emerald-50 to-white dark:from-zinc-950 dark:to-zinc-900 px-4 py-10">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => router.push("/start")}
            className="text-sm text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-white mb-6 flex items-center gap-1"
          >
            ← Create another
          </button>

          {/* Quest Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-emerald-100 dark:border-zinc-800 overflow-hidden">
            <div className="bg-emerald-600 px-6 py-5 text-white">
              <div className="flex items-center justify-between mb-1">
                <p className="text-emerald-100 text-sm font-medium">
                  Your OutsideQuest
                </p>
                {/* Status badge */}
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-white/20">
                  {status === "ongoing"
                    ? "Ongoing"
                    : status === "completed"
                      ? "Completed"
                      : "Not started"}
                </span>
              </div>
              <h1 className="text-2xl font-bold leading-tight">
                {quest.title}
              </h1>
            </div>

            <div className="px-6 py-4 flex flex-wrap gap-3 border-b border-emerald-50 dark:border-zinc-800">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-xs font-medium">
                ⏱ {quest.duration} min
              </span>
              {quest.tags?.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>

            {quest.description && (
              <div className="px-6 pt-5">
                <p className="text-emerald-800 dark:text-emerald-200 text-sm leading-relaxed">
                  {quest.description}
                </p>
              </div>
            )}

            <div className="px-6 py-6">
              <h2 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100 uppercase tracking-wide mb-4">
                Your mission
              </h2>
              <ul className="space-y-3">
                {quest.tasks.map((task, index) => (
                  <li key={task.id || index} className="flex gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-emerald-900 dark:text-emerald-100 leading-relaxed">
                      {task.description}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Limit Warning */}
          {limitWarning && (
            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl text-amber-800 dark:text-amber-300 text-sm font-medium flex items-center gap-2.5">
              <span className="text-lg">⚠️</span>
              <span>{limitWarning}</span>
            </div>
          )}

          {/* Dynamic button */}
          <button
            onClick={button.action}
            className="mt-8 w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl shadow-lg transition-all active:scale-[0.98] text-lg"
          >
            {button.label}
          </button>

          <p className="text-center text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-6">
            {button.subtext}
          </p>
        </div>
      </main>

      {/* Modal */}
      {showStartModal && (
        <StartQuestModal
          quest={quest}
          onClose={() => setShowStartModal(false)}
          onQuestUpdate={(updated) => setQuest(updated)}
        />
      )}
    </>
  );
}
