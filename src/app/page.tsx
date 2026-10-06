"use client";

import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-linear-to-b from-emerald-50 via-white to-emerald-50 flex flex-col">
      {/* Navbar */}
      

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Powered by local open-weight AI
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-emerald-950 mb-6 leading-tight">
          Less scrolling.
          <br />
          <span className="text-emerald-600">More living.</span>
        </h1>

        <p className="text-lg sm:text-xl text-emerald-800/80 max-w-xl mb-10 leading-relaxed">
          OutsideQuest uses a local open-weight model to create small,
          personalized outdoor missions — then tells you to put your phone away.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button
            onClick={() => router.push("/start")}
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl shadow-lg transition-all active:scale-[0.98] text-lg"
          >
            Start Your First Quest
          </button>

          <button
            onClick={() => router.push("/journal")}
            className="px-8 py-4 bg-white border-2 border-emerald-200 hover:border-emerald-400 text-emerald-800 font-medium rounded-2xl transition-all active:scale-[0.98] text-lg"
          >
            View Journal
          </button>
        </div>

        {/* Tiny social proof / philosophy */}
        <p className="mt-12 text-sm text-emerald-600/70 max-w-md">
          The success metric isn’t screen time.
          <br />
          It’s time spent away from the screen.
        </p>
      </section>

      {/* Bottom Feature Strip */}
      <section className="w-full border-t border-emerald-100 bg-white/60 backdrop-blur-sm py-8">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-2xl mb-2">🌿</div>
            <h3 className="font-semibold text-emerald-900 mb-1">
              Personalized
            </h3>
            <p className="text-sm text-emerald-700/80">
              Missions shaped by your time, mood & environment
            </p>
          </div>
          <div>
            <div className="text-2xl mb-2">📵</div>
            <h3 className="font-semibold text-emerald-900 mb-1">Phone Away</h3>
            <p className="text-sm text-emerald-700/80">
              Designed to make the screen the shortest part
            </p>
          </div>
          <div>
            <div className="text-2xl mb-2">🔒</div>
            <h3 className="font-semibold text-emerald-900 mb-1">Fully Local</h3>
            <p className="text-sm text-emerald-700/80">
              Runs on open-weight AI. Your data never leaves the device.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
