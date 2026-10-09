import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const LOG_FILE = path.join(process.cwd(), "quest-test-logs.json");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      questId,
      status,
      startedAt,
      remainingSeconds,
      lastPausedAt,
      reflection,
      moodBefore,
      moodAfter,
      minutesOutside,
      completedAt,
    } = body;

    if (!questId) {
      return NextResponse.json({ error: "questId required" }, { status: 400 });
    }

    let logs: any[] = [];
    try {
      const raw = await fs.readFile(LOG_FILE, "utf-8");
      logs = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "Log file not found" },
        { status: 404 },
      );
    }

    // Find the entry that contains this quest
    const index = logs.findIndex((entry) => entry.quest?.id === questId);

    if (index === -1) {
      return NextResponse.json({ error: "Quest not found" }, { status: 404 });
    }

    // Update the quest object inside the log entry
    logs[index].quest = {
      ...logs[index].quest,
      status: status ?? logs[index].quest.status,
      startedAt: startedAt ?? logs[index].quest.startedAt,
      remainingSeconds:
        remainingSeconds !== undefined
          ? remainingSeconds
          : logs[index].quest.remainingSeconds,
      lastPausedAt: lastPausedAt ?? logs[index].quest.lastPausedAt,
      reflection: reflection ?? logs[index].quest.reflection,
      moodBefore: moodBefore ?? logs[index].quest.moodBefore,
      moodAfter: moodAfter ?? logs[index].quest.moodAfter,
      minutesOutside:
        minutesOutside !== undefined
          ? minutesOutside
          : logs[index].quest.minutesOutside,
      completedAt: completedAt ?? logs[index].quest.completedAt,
    };

    // keep a top-level copy of the progress for easy reading
    logs[index].progress = {
      status: logs[index].quest.status,
      startedAt: logs[index].quest.startedAt,
      remainingSeconds: logs[index].quest.remainingSeconds,
      lastPausedAt: logs[index].quest.lastPausedAt,
      updatedAt: new Date().toISOString(),
    };

    await fs.writeFile(LOG_FILE, JSON.stringify(logs, null, 2), "utf-8");

    return NextResponse.json({
      success: true,
      quest: logs[index].quest,
    });
  } catch (err) {
    console.error("update-quest-progress error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
