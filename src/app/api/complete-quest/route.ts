import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { saveFinalQuest } from "@/lib/tempDb";
import { CompletedQuest } from "@/lib/types";

const LOG_FILE = path.join(process.cwd(), "quest-test-logs.json");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      questId,
      reflection,
      moodBefore,
      moodAfter,
      minutesOutside,
      completedAt,
      startedAt,
      quest: fallbackQuest,
    } = body;

    const targetId = questId || fallbackQuest?.id;

    if (!targetId) {
      return NextResponse.json(
        { error: "questId is required" },
        { status: 400 },
      );
    }

    let logs: any[] = [];
    try {
      const raw = await fs.readFile(LOG_FILE, "utf-8");
      logs = JSON.parse(raw);
    } catch {
      logs = [];
    }

    const index = logs.findIndex((entry) => entry.quest?.id === targetId);

    const completionTime = completedAt || new Date().toISOString();

    if (index !== -1) {
      // Update existing quest
      logs[index].quest = {
        ...logs[index].quest,
        status: "completed",
        remainingSeconds: 0,
        reflection: reflection || logs[index].quest.reflection,
        moodBefore: moodBefore || logs[index].quest.moodBefore,
        moodAfter: moodAfter || logs[index].quest.moodAfter,
        minutesOutside:
          typeof minutesOutside === "number"
            ? minutesOutside
            : logs[index].quest.minutesOutside,
        completedAt: completionTime,
        startedAt: startedAt || logs[index].quest.startedAt,
      };

      logs[index].progress = {
        status: "completed",
        startedAt: logs[index].quest.startedAt,
        remainingSeconds: 0,
        lastPausedAt: completionTime,
        updatedAt: completionTime,
      };

      // Also persist to final-quest.json
      const finalEntry: CompletedQuest = {
        questId: targetId,
        quest: logs[index].quest,
        reflection,
        moodBefore,
        moodAfter,
        minutesOutside,
        completedAt: completionTime,
        startedAt: logs[index].quest.startedAt,
      };
      await saveFinalQuest(finalEntry);

      await fs.writeFile(LOG_FILE, JSON.stringify(logs, null, 2), "utf-8");

      return NextResponse.json({
        success: true,
        quest: logs[index].quest,
      });
    } else if (fallbackQuest) {
      // Create new completed quest entry if not found in log
      const completedQuestObj = {
        ...fallbackQuest,
        status: "completed",
        remainingSeconds: 0,
        reflection,
        moodBefore,
        moodAfter,
        minutesOutside,
        completedAt: completionTime,
        startedAt,
      };

      const newEntry = {
        timestamp: completionTime,
        preferences: fallbackQuest.basedOn || null,
        quest: completedQuestObj,
        progress: {
          status: "completed",
          startedAt,
          remainingSeconds: 0,
          lastPausedAt: completionTime,
          updatedAt: completionTime,
        },
      };

      logs.push(newEntry);
      await fs.writeFile(LOG_FILE, JSON.stringify(logs, null, 2), "utf-8");

      const finalEntry: CompletedQuest = {
        questId: targetId,
        quest: completedQuestObj,
        reflection,
        moodBefore,
        moodAfter,
        minutesOutside,
        completedAt: completionTime,
        startedAt,
      };
      await saveFinalQuest(finalEntry);

      return NextResponse.json({
        success: true,
        quest: completedQuestObj,
      });
    }

    return NextResponse.json(
      { error: "Quest not found in logs" },
      { status: 404 },
    );
  } catch (err) {
    console.error("complete-quest error:", err);
    return NextResponse.json(
      { error: "Failed to save completed quest" },
      { status: 500 },
    );
  }
}
