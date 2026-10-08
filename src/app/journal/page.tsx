"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { GeneratedQuest, QuestStatus } from "@/lib/types";
import Loader from "@/components/Loader";
import StartQuestModal from "@/components/StartQuest";

interface HistoryQuest extends GeneratedQuest {
  loggedAt?: string;
  feedback?: string;
}

const MOOD_EMOJIS: Record<string, string> = {
  relax: "😌",
  explore: "🧭",
  calm: "🧘",
  nature: "🌿",
  move: "🏃",
  create: "📸",
  curious: "🧐",
  adventurous: "🧗",
  reflective: "💭",
  anxious: "😰",
  bored: "🥱",
};

type FilterStatus = "all" | QuestStatus;

export default function HistoryPage() {
  const router = useRouter();
  const [quests, setQuests] = useState<HistoryQuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuest, setSelectedQuest] = useState<HistoryQuest | null>(null);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [activeRunningQuest, setActiveRunningQuest] = useState<HistoryQuest | null>(null);
  const [limitWarning, setLimitWarning] = useState<string | null>(null);

  // Live remaining seconds per quest (questId → seconds)
  const [liveRemaining, setLiveRemaining] = useState<Record<string, number>>(
    {},
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleStartOrResume = (quest: HistoryQuest) => {
    const ongoingCount = quests.filter((q) => q.status === "ongoing").length;
    if (quest.status !== "ongoing" && ongoingCount >= 2) {
      setLimitWarning(
        "You already have 2 quests in progress. Finish or complete one before starting another."
      );
      return;
    }
    setLimitWarning(null);
    setSelectedQuest(null);
    setActiveRunningQuest(quest);
  };

  const handleActiveQuestUpdate = (updated: GeneratedQuest) => {
    setQuests((prev) =>
      prev.map((q) => (q.id === updated.id ? { ...q, ...updated } : q))
    );
    if (updated.status === "ongoing") {
      const secs =
        typeof updated.remainingSeconds === "number"
          ? updated.remainingSeconds
          : updated.duration * 60;
      setLiveRemaining((prev) => ({ ...prev, [updated.id]: secs }));
    } else if (updated.status === "completed") {
      setLiveRemaining((prev) => {
        const next = { ...prev };
        delete next[updated.id];
        return next;
      });
    }
  };

  // Guard against multiple completion API calls for the same quest
  const completingRef = useRef<Set<string>>(new Set());

  const handleQuestCompletion = async (questId: string) => {
    if (completingRef.current.has(questId)) return;
    completingRef.current.add(questId);

    const nowIso = new Date().toISOString();

    // 1. Update local quests state so status = "completed" and remainingSeconds = 0
    setQuests((prev) =>
      prev.map((q) =>
        q.id === questId
          ? {
              ...q,
              status: "completed" as QuestStatus,
              remainingSeconds: 0,
              lastPausedAt: nowIso,
            }
          : q,
      ),
    );

    // 2. Remove quest from liveRemaining map
    setLiveRemaining((prev) => {
      const next = { ...prev };
      delete next[questId];
      return next;
    });

    // 3. Update selectedQuest if open in modal
    setSelectedQuest((prev) =>
      prev && prev.id === questId
        ? {
            ...prev,
            status: "completed" as QuestStatus,
            remainingSeconds: 0,
            lastPausedAt: nowIso,
          }
        : prev,
    );

    // 4. Persist the change to quest-test-logs.json via POST /api/update-quest-progress
    try {
      await fetch("/api/update-quest-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questId,
          status: "completed",
          remainingSeconds: 0,
          lastPausedAt: nowIso,
        }),
      });
    } catch (err) {
      console.error(`Failed to persist completion for quest ${questId}:`, err);
    }
  };

  const handleQuestCompletionRef = useRef(handleQuestCompletion);
  handleQuestCompletionRef.current = handleQuestCompletion;

  // Load history + recalculate remaining time from wall clock
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await fetch("/api/generate");
        const data: HistoryQuest[] = await res.json();
        setQuests(data);

        const now = Date.now();
        const initial: Record<string, number> = {};
        const expiredOnLoad: string[] = [];

        data.forEach((q) => {
          if (q.status !== "ongoing") return;

          let remaining = 0;

          if (typeof q.remainingSeconds === "number" && q.lastPausedAt) {
            const pausedAt = new Date(q.lastPausedAt).getTime();
            const elapsedSincePause = Math.floor((now - pausedAt) / 1000);
            remaining = Math.max(0, q.remainingSeconds - elapsedSincePause);
          } else if (q.startedAt) {
            const startedAt = new Date(q.startedAt).getTime();
            const elapsedSinceStart = Math.floor((now - startedAt) / 1000);
            const totalSeconds = q.duration * 60;
            remaining = Math.max(0, totalSeconds - elapsedSinceStart);
          } else if (typeof q.remainingSeconds === "number") {
            remaining = Math.max(0, q.remainingSeconds);
          }

          if (remaining <= 0) {
            expiredOnLoad.push(q.id);
          } else {
            initial[q.id] = remaining;
          }
        });

        setLiveRemaining(initial);

        // Auto-complete quests that already ran out of time while user was away
        expiredOnLoad.forEach((id) => {
          handleQuestCompletionRef.current(id);
        });
      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  // Start / stop the live countdown
  useEffect(() => {
    const hasOngoing = Object.keys(liveRemaining).length > 0;
    if (!hasOngoing) return;

    intervalRef.current = setInterval(() => {
      setLiveRemaining((prev) => {
        const next: Record<string, number> = {};
        const completedIds: string[] = [];
        let changed = false;

        for (const [id, secs] of Object.entries(prev)) {
          if (secs > 1) {
            next[id] = secs - 1;
            changed = true;
          } else {
            // Time reached 0 (do not let it go negative)
            completedIds.push(id);
            changed = true;
          }
        }

        // Trigger auto-complete for any quest that hit 0
        if (completedIds.length > 0) {
          completedIds.forEach((id) => {
            handleQuestCompletionRef.current(id);
          });
        }

        return changed ? next : prev;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [Object.keys(liveRemaining).length]);

  // Format helper
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const filteredQuests =
    filter === "all"
      ? quests
      : quests.filter((q) => (q.status || "not_started") === filter);

  const statusCounts = {
    all: quests.length,
    not_started: quests.filter(
      (q) => (q.status || "not_started") === "not_started",
    ).length,
    ongoing: quests.filter((q) => q.status === "ongoing").length,
    completed: quests.filter((q) => q.status === "completed").length,
  };

  if (loading) return <Loader />;

  return (
    <main className="min-h-screen bg-linear-to-b from-emerald-50 to-white dark:from-gray-900 dark:to-gray-950 px-4 py-10 relative transition-colors duration-200">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-emerald-900 dark:text-emerald-400">
              Quest History
            </h1>
            <p className="text-sm text-emerald-700/70 dark:text-gray-400 mt-1">
              {quests.length} quest{quests.length !== 1 ? "s" : ""} total
            </p>
          </div>

          <button
            onClick={() => router.push("/start")}
            className="text-sm font-medium text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-100 bg-emerald-100/50 dark:bg-emerald-900/30 px-4 py-2 rounded-lg transition-colors"
          >
            + New Quest
          </button>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2 mb-8">
          {(
            [
              { key: "all", label: "All" },
              { key: "not_started", label: "Not started" },
              { key: "ongoing", label: "Ongoing" },
              { key: "completed", label: "Completed" },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                filter === item.key
                  ? "bg-emerald-600 text-white"
                  : "bg-white dark:bg-gray-800 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-gray-700 hover:border-emerald-400"
              }`}
            >
              {item.label}
              <span className="ml-1.5 opacity-70">
                ({statusCounts[item.key]})
              </span>
            </button>
          ))}
        </div>

        {/* Empty state */}
        {filteredQuests.length === 0 && (
          <div className="text-center py-20">
            <p className="text-emerald-700/60 dark:text-gray-400 text-sm">
              {filter === "all"
                ? "No quests yet. Go create your first OutsideQuest!"
                : `No ${filter.replace("_", " ")} quests.`}
            </p>
            {filter === "all" && (
              <button
                onClick={() => router.push("/start")}
                className="mt-6 px-6 py-3 bg-emerald-600 dark:bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors"
              >
                Create Quest
              </button>
            )}
          </div>
        )}

        {/* Quest grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuests.map((quest) => {
            const status = quest.status || "not_started";

            // Live time if ongoing and has time left, otherwise nothing
            const timerDisplay =
              status === "ongoing" &&
              liveRemaining[quest.id] !== undefined &&
              liveRemaining[quest.id] > 0
                ? formatTime(liveRemaining[quest.id])
                : null;

            return (
              <div
                key={quest.id + (quest.loggedAt || "")}
                className="relative flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-emerald-100 dark:border-gray-700 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200"
              >
                {/* Status + Live Timer */}
                <div className="absolute top-3 right-3 flex flex-col items-end gap-1 z-10">
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                      status === "ongoing"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                        : status === "completed"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {status === "not_started"
                      ? "Not started"
                      : status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>

                  {timerDisplay && (
                    <span className="text-xs font-mono font-medium tabular-nums bg-black/80 text-white px-2 py-0.5 rounded-md">
                      {timerDisplay}
                    </span>
                  )}
                </div>

                {/* Title bar */}
                <div className="px-5 py-4 border-b border-emerald-50 dark:border-gray-700 pr-24">
                  <h2 className="font-semibold text-emerald-900 dark:text-emerald-50 text-lg leading-snug">
                    {quest.title}
                  </h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-gray-700 text-emerald-800 dark:text-emerald-300 text-xs font-medium">
                      ⏱ {quest.duration} min
                    </span>
                    {quest.tags?.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-gray-700 text-emerald-800 dark:text-emerald-300 text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Description + tasks */}
                <div className="px-5 py-4 grow">
                  {quest.description && (
                    <p className="text-sm text-emerald-800/90 dark:text-gray-300 mb-3 leading-relaxed line-clamp-2">
                      {quest.description}
                    </p>
                  )}

                  <ul className="space-y-1.5">
                    {quest.tasks.slice(0, 2).map((task, idx) => (
                      <li
                        key={task.id || idx}
                        className="flex gap-2 text-sm text-emerald-900 dark:text-gray-200"
                      >
                        <span className="text-emerald-500 dark:text-emerald-400 font-medium shrink-0">
                          {idx + 1}.
                        </span>
                        <span className="leading-relaxed line-clamp-1">
                          {task.description}
                        </span>
                      </li>
                    ))}
                    {quest.tasks.length > 2 && (
                      <li className="text-xs text-emerald-600/70 dark:text-gray-500 pl-5">
                        + {quest.tasks.length - 2} more steps
                      </li>
                    )}
                  </ul>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 bg-emerald-50/50 dark:bg-gray-800/50 border-t border-emerald-50 dark:border-gray-700 flex items-center justify-between text-xs text-emerald-700/70 dark:text-gray-400">
                  <span>
                    {quest.loggedAt
                      ? new Date(quest.loggedAt).toLocaleDateString()
                      : quest.generatedAt
                        ? new Date(quest.generatedAt).toLocaleDateString()
                        : ""}
                  </span>
                  <button
                    onClick={() => setSelectedQuest(quest)}
                    className="font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 transition-colors"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Modal (same as before) */}
      {selectedQuest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 dark:bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedQuest(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-emerald-100 dark:border-gray-800 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
                  {selectedQuest.title}
                </h2>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 capitalize">
                  Status: {selectedQuest.status || "not_started"}
                </span>
              </div>
              <button
                onClick={() => setSelectedQuest(null)}
                className="text-emerald-900/50 dark:text-gray-500 hover:text-emerald-900 dark:hover:text-gray-300 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-6 overflow-y-auto space-y-6">
              {/* User Input */}
              <section>
                <h3 className="text-sm font-bold tracking-wider text-emerald-600 dark:text-emerald-500 uppercase mb-3">
                  User Input
                </h3>
                <div className="bg-emerald-50/50 dark:bg-gray-800 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="block text-xs text-emerald-600/70 dark:text-gray-400 mb-1">
                      Duration
                    </span>
                    <span className="font-medium text-emerald-900 dark:text-gray-200">
                      {selectedQuest.duration} min
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-emerald-600/70 dark:text-gray-400 mb-1">
                      Mood
                    </span>
                    <span className="font-medium text-emerald-900 dark:text-gray-200 capitalize">
                      {selectedQuest.basedOn?.mood || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-emerald-600/70 dark:text-gray-400 mb-1">
                      Environment
                    </span>
                    <span className="font-medium text-emerald-900 dark:text-gray-200 capitalize">
                      {selectedQuest.basedOn?.environment || "N/A"}
                    </span>
                  </div>
                </div>
              </section>

              {/* Tasks */}
              <section>
                <h3 className="text-sm font-bold tracking-wider text-emerald-600 dark:text-emerald-500 uppercase mb-3">
                  Generated Quest
                </h3>
                {selectedQuest.description && (
                  <p className="text-emerald-800 dark:text-gray-300 mb-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-emerald-100 dark:border-gray-700">
                    {selectedQuest.description}
                  </p>
                )}
                <div className="space-y-3">
                  {selectedQuest.tasks.map((task, idx) => (
                    <div
                      key={task.id || idx}
                      className="flex gap-3 bg-white dark:bg-gray-800 border border-emerald-100 dark:border-gray-700 p-4 rounded-xl"
                    >
                      <span className="text-emerald-500 font-bold bg-emerald-50 dark:bg-gray-700 h-8 w-8 rounded-full flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <p className="text-emerald-900 dark:text-gray-200 pt-1">
                        {task.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* 3. Quest Feedback / Reflection */}
              <section>
                <h3 className="text-sm font-bold tracking-wider text-emerald-600 dark:text-emerald-500 uppercase mb-3 flex items-center gap-1.5">
                  <span>💭</span> Quest Feedback / Reflection
                </h3>
                {selectedQuest.reflection ? (
                  <div className="bg-emerald-50/50 dark:bg-gray-800 border border-emerald-100 dark:border-gray-700 rounded-2xl p-4 space-y-3">
                    <p className="text-emerald-950 dark:text-gray-100 text-sm leading-relaxed italic bg-white dark:bg-gray-900/60 p-3 rounded-xl border border-emerald-100/50 dark:border-gray-700">
                      &ldquo;{selectedQuest.reflection}&rdquo;
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
                      {selectedQuest.moodBefore && (
                        <div className="bg-white dark:bg-gray-900/60 p-2.5 rounded-xl border border-emerald-100/60 dark:border-gray-700">
                          <span className="block text-emerald-600/80 dark:text-gray-400 font-medium mb-0.5">
                            Mood Before
                          </span>
                          <span className="font-semibold text-emerald-950 dark:text-gray-200 capitalize flex items-center gap-1">
                            <span>{MOOD_EMOJIS[selectedQuest.moodBefore] || "💭"}</span>
                            <span>{selectedQuest.moodBefore}</span>
                          </span>
                        </div>
                      )}

                      {selectedQuest.moodAfter && (
                        <div className="bg-white dark:bg-gray-900/60 p-2.5 rounded-xl border border-emerald-100/60 dark:border-gray-700">
                          <span className="block text-emerald-600/80 dark:text-gray-400 font-medium mb-0.5">
                            Mood After
                          </span>
                          <span className="font-semibold text-emerald-950 dark:text-gray-200 capitalize flex items-center gap-1">
                            <span>{MOOD_EMOJIS[selectedQuest.moodAfter] || "💭"}</span>
                            <span>{selectedQuest.moodAfter}</span>
                          </span>
                        </div>
                      )}

                      {typeof selectedQuest.minutesOutside === "number" && (
                        <div className="bg-white dark:bg-gray-900/60 p-2.5 rounded-xl border border-emerald-100/60 dark:border-gray-700 col-span-2 sm:col-span-1">
                          <span className="block text-emerald-600/80 dark:text-gray-400 font-medium mb-0.5">
                            Minutes Outside
                          </span>
                          <span className="font-semibold text-emerald-950 dark:text-gray-200">
                            ⏱ {selectedQuest.minutesOutside} min
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-50/30 dark:bg-gray-800/60 border border-emerald-100/60 dark:border-gray-700 rounded-2xl p-4 text-center">
                    <p className="text-emerald-700/60 dark:text-gray-400 text-sm italic">
                      No reflection recorded
                    </p>
                  </div>
                )}
              </section>
            </div>

            {/* Modal Footer with Actions */}
            <div className="px-6 py-4 border-t border-emerald-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col gap-3">
              {limitWarning && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-300 text-xs sm:text-sm font-medium flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{limitWarning}</span>
                </div>
              )}

              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  {(selectedQuest.status || "not_started") === "not_started" && (
                    <button
                      onClick={() => handleStartOrResume(selectedQuest)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition shadow-sm flex items-center gap-1.5"
                    >
                      <span>🌱</span>
                      <span>Start Quest</span>
                    </button>
                  )}

                  {(selectedQuest.status || "not_started") === "ongoing" && (
                    <button
                      onClick={() => handleStartOrResume(selectedQuest)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition shadow-sm flex items-center gap-1.5"
                    >
                      <span>▶</span>
                      <span>Resume Quest</span>
                    </button>
                  )}

                  {(selectedQuest.status || "not_started") === "completed" && (
                    <button
                      onClick={() => {
                        setSelectedQuest(null);
                        setLimitWarning(null);
                        router.push(`/reflect?id=${selectedQuest.id}`);
                      }}
                      className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 rounded-xl text-sm font-semibold transition border border-emerald-200 dark:border-emerald-700 flex items-center gap-1.5"
                    >
                      <span>📝</span>
                      <span>Reflect</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => {
                    setSelectedQuest(null);
                    setLimitWarning(null);
                  }}
                  className="px-5 py-2.5 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Start / Running Quest Modal */}
      {activeRunningQuest && (
        <StartQuestModal
          quest={activeRunningQuest}
          onClose={() => setActiveRunningQuest(null)}
          onQuestUpdate={handleActiveQuestUpdate}
        />
      )}
    </main>
  );
}
