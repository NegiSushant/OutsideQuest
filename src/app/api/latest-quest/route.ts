import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const LOG_FILE = path.join(process.cwd(), "quest-test-logs.json");

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetId = searchParams.get("id");

    const data = await fs.readFile(LOG_FILE, "utf-8");
    const logs = JSON.parse(data);

    if (!Array.isArray(logs) || logs.length === 0) {
      return NextResponse.json(
        { error: "No quests found in log" },
        { status: 404 },
      );
    }

    let targetEntry;
    if (targetId) {
      targetEntry = logs.find((entry) => entry.quest?.id === targetId);
    }

    // Fallback: Get the most recent successful quest
    if (!targetEntry) {
      targetEntry = [...logs].reverse().find((entry) => entry.quest !== null);
    }

    if (!targetEntry || !targetEntry.quest) {
      return NextResponse.json(
        { error: "No successful quest found" },
        { status: 404 },
      );
    }

    return NextResponse.json(targetEntry.quest);
  } catch (err) {
    console.error("Failed to read quest log:", err);
    return NextResponse.json(
      { error: "Could not read quest log" },
      { status: 500 },
    );
  }
}
