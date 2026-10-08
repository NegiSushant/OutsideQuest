"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { GeneratedQuest, QuestStatus } from "@/lib/types";

interface StartQuestModalProps {
  quest: GeneratedQuest;
  onClose: () => void;
  onQuestUpdate?: (updated: GeneratedQuest) => void;
}

export default function StartQuestModal({
  quest,
  onClose,
  onQuestUpdate,
}: StartQuestModalProps) {
  const router = useRouter();

  const getInitialRemaining = () => {
    if (typeof quest.remainingSeconds === "number") {
      return Math.max(0, quest.remainingSeconds);
    }
    return quest.duration * 60;
  };

  const [phase, setPhase] = useState<"countdown" | "running">(
    quest.status === "ongoing" ? "running" : "countdown",
  );
  const [count, setCount] = useState(3);
  const [remainingSeconds, setRemainingSeconds] = useState(getInitialRemaining);
  const [status, setStatus] = useState<QuestStatus>(
    quest.status || "not_started",
  );
  const hasStarted = useRef(false);

  // Save progress into quest-test-logs.json
  const persistProgress = async (updates: {
    status: QuestStatus;
    startedAt?: string;
    remainingSeconds: number;
    lastPausedAt?: string;
  }) => {
    try {
      const res = await fetch("/api/update-quest-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questId: quest.id,
          ...updates,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        onQuestUpdate?.(data.quest);
      }
    } catch (err) {
      console.error("Failed to persist progress", err);
    }
  };

  // 3-2-1 countdown
  useEffect(() => {
    if (phase !== "countdown") return;

    if (count <= 0) {
      if (hasStarted.current) return;
      hasStarted.current = true;

      const startTime = quest.startedAt || new Date().toISOString();
      const totalSeconds = quest.duration * 60;

      try {
        localStorage.setItem("outsidequest_started_at", startTime);
        localStorage.setItem("outsidequest_current", JSON.stringify(quest));
      } catch (e) {
        console.error("Failed to write to localStorage:", e);
      }

      setStatus("ongoing");
      setRemainingSeconds(totalSeconds);

      persistProgress({
        status: "ongoing",
        startedAt: startTime,
        remainingSeconds: totalSeconds,
      });

      const t = setTimeout(() => setPhase("running"), 0);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, count, quest]);

  // Live reverse timer
  useEffect(() => {
    if (phase !== "running") return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setStatus("completed");
          persistProgress({
            status: "completed",
            remainingSeconds: 0,
            lastPausedAt: new Date().toISOString(),
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  // Pause + close
  const handlePauseAndClose = () => {
    const safeRemaining = Math.max(0, remainingSeconds);
    const newStatus: QuestStatus =
      safeRemaining === 0 ? "completed" : "ongoing";

    persistProgress({
      status: newStatus,
      remainingSeconds: safeRemaining,
      lastPausedAt: new Date().toISOString(),
    });

    onClose();
  };

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeDisplay = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const canReflect = status === "completed" || remainingSeconds === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4">
        <button
          onClick={handlePauseAndClose}
          className="absolute -top-12 right-0 text-white/70 hover:text-white text-sm"
        >
          Close
        </button>

        {phase === "countdown" ? (
          <div className="bg-emerald-950 rounded-3xl p-10 text-center text-white shadow-2xl">
            <p className="text-emerald-300/80 text-sm tracking-widest uppercase mb-8">
              Starting in
            </p>
            <div
              key={count}
              className="text-8xl font-bold leading-none tabular-nums animate-in zoom-in-50 fade-in duration-500"
            >
              {count === 0 ? "GO" : count}
            </div>
            <p className="mt-8 text-emerald-400/70 text-sm">
              Get ready to step outside
            </p>
          </div>
        ) : (
          <div className="bg-emerald-950 rounded-3xl p-10 text-center text-white shadow-2xl">
            <p className="text-emerald-300/80 text-sm tracking-widest uppercase mb-4">
              Time remaining
            </p>

            <div className="text-6xl font-bold tabular-nums tracking-tight mb-2">
              {timeDisplay}
            </div>

            <p className="text-emerald-400/80 text-sm mb-8">
              Put your phone away.
              <br />
              See you in {quest.duration} minutes.
            </p>

            <div className="pt-6 border-t border-emerald-800/60 space-y-4">
              <p className="text-emerald-400/70 text-sm">
                {canReflect
                  ? "Time’s up — your quest is complete."
                  : "Your quest is running."}
              </p>

              <button
                onClick={() => {
                  handlePauseAndClose();
                  router.push(`/reflect?id=${quest.id}`);
                }}
                disabled={!canReflect}
                className={`w-full py-3 rounded-xl text-sm font-medium transition ${canReflect
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                    : "bg-emerald-900/60 text-emerald-500 cursor-not-allowed"
                  }`}
              >
                I’m back — Reflect
              </button>

              <button
                onClick={handlePauseAndClose}
                className="text-xs text-emerald-500 hover:text-emerald-300 transition"
              >
                Keep going (close)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}