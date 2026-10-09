"use client";

import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-emerald-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-12 mt-auto transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
        {/* Brand & Core Value */}
        <div className="col-span-1 md:col-span-1">
          <h3 className="text-lg font-bold text-emerald-950 dark:text-white mb-3">
            OutsideQuest
          </h3>
          <p className="text-sm text-emerald-700/80 dark:text-zinc-400 mb-4 leading-relaxed pr-4">
            A minimalist approach to escaping the screen. Powered by local,
            open-weight AI to ensure your thoughts and routines never leave your
            device.
          </p>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 text-xs font-medium border border-emerald-100 dark:border-emerald-800/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            100% Local Inference
          </div>
        </div>

        {/* Hackathon Resources */}
        <div className="col-span-1 flex flex-col space-y-3">
          <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">
            Project Links
          </h4>
          <Link
            href="https://github.com/NegiSushant/OutsideQuest"
            className="text-sm text-emerald-600 dark:text-zinc-400 hover:text-emerald-900 dark:hover:text-emerald-300 transition w-fit"
          >
            Source Code (GitHub)
          </Link>
        </div>

        {/* Tech Stack */}
        <div className="col-span-1 flex flex-col space-y-3">
          <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">
            Built With
          </h4>
          <span className="text-sm text-emerald-600 dark:text-zinc-400">
            Next.js 15 (App Router)
          </span>
          <span className="text-sm text-emerald-600 dark:text-zinc-400">
            Tailwind CSS v4
          </span>
          <span className="text-sm text-emerald-600 dark:text-zinc-400">
            gemma3:1b-q4_K_M (Local)
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-12 pt-8 border-t border-emerald-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-600/70 dark:text-zinc-500">
        <p>© {currentYear} OutsideQuest. Built during Hackathon.</p>
        <p>
          Made with ☕ and{" "}
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            zero cloud tracking
          </span>{" "}
          in India.
        </p>
      </div>
    </footer>
  );
}
