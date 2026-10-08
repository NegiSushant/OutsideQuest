"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { GeneratedQuest } from "@/lib/types";

export default function StartQuestPage() {
  const router = useRouter();
  const [quest, setQuest] = useState<GeneratedQuest | null>(null);
  const [phase, setPhase] = useState<"loading" | "countdown" | "away">(
    "loading",
  );
  const [count, setCount] = useState(3);
  const hasStarted = useRef(false);

  // Load the current quest
  useEffect(() => {
    const loadQuest = async () => {
      try {
        const res = await fetch("/api/latest-quest");
        if (res.ok) {
          const data = await res.json();
          setQuest(data);
          setPhase("countdown");
          return;
        }

        const raw = localStorage.getItem("outsidequest_current");
        if (raw) {
          setQuest(JSON.parse(raw));
          setPhase("countdown");
          return;
        }

        router.replace("/start");
      } catch {
        router.replace("/start");
      }
    };

    loadQuest();
  }, [router]);

  // Countdown logic
  useEffect(() => {
    if (phase !== "countdown") return;

    if (count <= 0) {
      // Only run once
      if (hasStarted.current) return;
      hasStarted.current = true;

      const startTime = new Date().toISOString();
      localStorage.setItem("outsidequest_started_at", startTime);

      if (quest) {
        localStorage.setItem(
          "outsidequest_active",
          JSON.stringify({
            questId: quest.id,
            startedAt: startTime,
            duration: quest.duration,
          }),
        );
      }

      // Defer the phase change so it's not synchronous inside the effect
      const timer = setTimeout(() => {
        setPhase("away");
      }, 0);

      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setCount((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [phase, count, quest]);

  // Loading
  if (phase === "loading" || !quest) {
    return (
      <main className="min-h-screen bg-emerald-950 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
      </main>
    );
  }

  // Countdown
  if (phase === "countdown") {
    return (
      <main className="min-h-screen bg-emerald-950 flex flex-col items-center justify-center text-white">
        <p className="text-emerald-300/80 text-sm tracking-widest uppercase mb-8">
          Starting in
        </p>

        <div
          key={count}
          className="text-[9rem] sm:text-[11rem] font-bold leading-none tabular-nums animate-in zoom-in-50 fade-in duration-500"
        >
          {count === 0 ? "GO" : count}
        </div>

        <p className="mt-10 text-emerald-400/70 text-sm">
          Get ready to step outside
        </p>
      </main>
    );
  }

  // Put your phone away
  return (
    <main className="min-h-screen bg-emerald-950 flex flex-col items-center justify-center px-6 text-center text-white">
      <div className="max-w-md space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
            Put your phone away.
          </h1>
          <p className="text-xl sm:text-2xl text-emerald-300 font-medium">
            See you in {quest.duration} minutes.
          </p>
        </div>

        <div className="pt-6 border-t border-emerald-800/60">
          <p className="text-emerald-400/70 text-sm leading-relaxed">
            Your quest has started.
            <br />
            Come back when you’re done.
          </p>
        </div>

        <button
          onClick={() => router.push("/quest")}
          className="mt-12 text-xs text-emerald-600 hover:text-emerald-400 transition"
        >
          Changed your mind? Go back
        </button>
      </div>
    </main>
  );
}
