"use client";

import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-linear-to-b from-emerald-50 via-white to-emerald-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 flex flex-col transition-colors duration-300">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 text-sm font-medium mb-8 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Powered by local open-weight AI
        </div>

        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-emerald-950 dark:text-white mb-6 leading-tight">
          Less scrolling.
          <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">
            More living.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-emerald-800/80 dark:text-zinc-400 max-w-2xl mb-10 leading-relaxed">
          OutsideQuest uses a local open-weight model to create small,
          personalized outdoor missions &mdash; then tells you to put your phone
          away and experience the real world.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button
            onClick={() => router.push("/start")}
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98] text-lg flex items-center justify-center gap-2"
          >
            Start Your First Quest
            <span aria-hidden="true">&rarr;</span>
          </button>

          <button
            onClick={() => router.push("/journal")}
            className="px-8 py-4 bg-white dark:bg-zinc-900 border-2 border-emerald-200 dark:border-zinc-700 hover:border-emerald-400 dark:hover:border-emerald-500 text-emerald-800 dark:text-zinc-300 font-medium rounded-2xl transition-all active:scale-[0.98] text-lg"
          >
            View History
          </button>
        </div>

        {/* Tiny social proof / philosophy */}
        <p className="mt-12 text-sm text-emerald-600/70 dark:text-zinc-500 max-w-md font-medium">
          The success metric isn&apos;t screen time.
          <br />
          It&apos;s time spent away from the screen.
        </p>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white/40 dark:bg-zinc-900/40 border-y border-emerald-100 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-emerald-950 dark:text-white mb-4">
              How it works
            </h2>
            <p className="text-emerald-700/80 dark:text-zinc-400">
              Three simple steps to reclaim your attention.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-emerald-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">
                🎯
              </div>
              <h3 className="text-xl font-bold text-emerald-950 dark:text-emerald-50 mb-2">
                1. Set your parameters
              </h3>
              <p className="text-emerald-800/70 dark:text-zinc-400 leading-relaxed">
                Tell the AI how much time you have, your current mood, and your
                environment (city, park, neighborhood).
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-emerald-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">
                📵
              </div>
              <h3 className="text-xl font-bold text-emerald-950 dark:text-emerald-50 mb-2">
                2. Pocket your phone
              </h3>
              <p className="text-emerald-800/70 dark:text-zinc-400 leading-relaxed">
                Get your unique multi-step quest. Memorize the first step, lock
                your screen, and start moving.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-emerald-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">
                ✍️
              </div>
              <h3 className="text-xl font-bold text-emerald-950 dark:text-emerald-50 mb-2">
                3. Log your journey
              </h3>
              <p className="text-emerald-800/70 dark:text-zinc-400 leading-relaxed">
                Come back when you&apos;re done. Jot down a quick reflection on
                what you noticed or felt along the way.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Strip */}
      <section className="w-full py-20 bg-emerald-50 dark:bg-zinc-950">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-12 text-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-zinc-800 flex items-center justify-center text-2xl mb-6 shadow-sm">
              🌿
            </div>
            <h3 className="text-lg font-bold text-emerald-900 dark:text-white mb-2">
              Hyper-Personalized
            </h3>
            <p className="text-sm text-emerald-700/80 dark:text-zinc-400 leading-relaxed max-w-xs">
              Missions shaped dynamically by your time constraints, mood, and
              exact surroundings. No two quests are the same.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-zinc-800 flex items-center justify-center text-2xl mb-6 shadow-sm">
              🧠
            </div>
            <h3 className="text-lg font-bold text-emerald-900 dark:text-white mb-2">
              Mindful by Design
            </h3>
            <p className="text-sm text-emerald-700/80 dark:text-zinc-400 leading-relaxed max-w-xs">
              Structured to break the dopamine loop. The goal is to make looking
              at your screen the shortest part of the experience.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-zinc-800 flex items-center justify-center text-2xl mb-6 shadow-sm">
              🔒
            </div>
            <h3 className="text-lg font-bold text-emerald-900 dark:text-white mb-2">
              Fully Local Privacy
            </h3>
            <p className="text-sm text-emerald-700/80 dark:text-zinc-400 leading-relaxed max-w-xs">
              Powered entirely by open-weight AI. Your thoughts, locations, and
              reflections never leave your device.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 text-center relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-emerald-200/30 dark:bg-emerald-900/10 blur-[100px] rounded-full -z-10 pointer-events-none"></div>

        <h2 className="text-4xl font-bold text-emerald-950 dark:text-white mb-6">
          Ready to head outside?
        </h2>
        <p className="text-emerald-800/80 dark:text-zinc-400 mb-10 max-w-md mx-auto">
          Take 15 minutes for yourself today. No notifications, no infinite
          scroll. Just you and your environment.
        </p>
        <button
          onClick={() => router.push("/start")}
          className="px-10 py-4 bg-emerald-950 dark:bg-white text-white dark:text-emerald-950 font-bold rounded-2xl shadow-xl hover:scale-105 transition-transform active:scale-95 text-lg"
        >
          Generate a Quest
        </button>
      </section>
    </main>
  );
}
