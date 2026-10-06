"use client";

import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathName = usePathname();

  return (
    <nav className="w-full px-6 py-5 flex items-center justify-between max-w-5xl mx-auto">
      <div className="text-xl font-bold text-emerald-900 tracking-tight">
        OutsideQuest
      </div>

      {pathName === "/" ? (
        <button
          onClick={() => router.push("/start")}
          className="text-sm font-medium text-emerald-700 hover:text-emerald-900 transition"
        >
          Start a Quest →
        </button>
      ) : (
        <button
          onClick={() => router.push("/")}
          className="text-sm font-medium text-emerald-700 hover:text-emerald-900 transition"
        >
          Home Page
        </button>
      )}
    </nav>
  );
}
