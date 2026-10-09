import { NextRequest, NextResponse } from "next/server";
import { UserPreferences, GeneratedQuest, CompletedQuest } from "@/lib/types";
import { promises as fs } from "fs";
import path from "path";
import { systemPrompt } from "@/lib/prompts";
import { dockerAI } from "@/lib/ai_client";
import { config } from "@/lib/config";
import { saveFinalQuest } from "@/lib/tempDb";

const LOG_FILE = path.join(process.cwd(), "quest-test-logs.json");

async function saveToLog(entry: {
  timestamp: string;
  preferences: UserPreferences | null; // Changed to accept null
  quest: GeneratedQuest | null;
  error?: string;
}) {
  try {
    let logs: any[] = [];
    try {
      const data = await fs.readFile(LOG_FILE, "utf-8");
      logs = JSON.parse(data);
    } catch {
      // File doesn't exist yet → start with empty array
    }

    logs.push(entry);

    await fs.writeFile(LOG_FILE, JSON.stringify(logs, null, 2), "utf-8");
    console.log(`Saved test log → ${LOG_FILE}`);
  } catch (err) {
    console.error("Failed to save test log:", err);
  }
}

export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString();
  let preferences: UserPreferences | null = null;

  try {
    preferences = (await request.json()) as UserPreferences;

    // Validate that preferences before building the prompt
    if (!preferences || !preferences.availableTime) {
      throw new Error("Invalid or missing user preferences");
    }

    const userPrompt = `Create a quest with these preferences:
    - Available time: ${preferences.availableTime} minutes
    - Mood: ${preferences.mood}
    - Environment: ${preferences.environment}
    ${preferences.isSurprise ? "- This is a surprise quest" : ""}
    ${preferences.notes ? `- Notes: ${preferences.notes}` : ""}`;

    // Call Docker Model Runner
    const response = await dockerAI.chat.completions.create({
      model: config.defaultModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 1000,
      temperature: 0.8,
    });

    const rawContent = response.choices[0]?.message?.content;

    console.log(`Model response: ${rawContent}`);
    if (!rawContent) {
      throw new Error("Empty response from model");
    }

    let quest: GeneratedQuest;
    try {
      const cleaned = rawContent
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
      quest = JSON.parse(cleaned);
      console.log(`generated json quest: ${quest}`);
    } catch {
      console.error("Failed to parse model output:", rawContent);
      throw new Error("Model did not return valid JSON");
    }

    // Ensure required fields
    quest.id = quest.id || crypto.randomUUID();
    quest.generatedAt = quest.generatedAt || new Date().toISOString();
    quest.basedOn = preferences;

    console.log("final quest:", quest);
    const final_quest: CompletedQuest = {
      questId: crypto.randomUUID(),
      quest: {
        ...quest,
      },
    };

    // save final quest for the persistent state
    await saveFinalQuest(final_quest);

    // Save successful request + response
    await saveToLog({
      timestamp,
      preferences,
      quest,
    });

    return NextResponse.json(quest);
  } catch (err) {
    console.error("Error in /api/generate-quest:", err);

    // Also log failed attempts. preferences can safely be null here now.
    await saveToLog({
      timestamp,
      preferences,
      quest: null,
      error: err instanceof Error ? err.message : "Unknown error",
    });

    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const data = await fs.readFile(LOG_FILE, "utf-8");
    const logs = JSON.parse(data);

    if (!Array.isArray(logs)) {
      return NextResponse.json([]);
    }

    // Only return successful quests, newest first
    const successful = logs
      .filter((entry: any) => entry.quest !== null)
      .map((entry: any) => ({
        ...entry.quest,
        loggedAt: entry.timestamp,
      }))
      .reverse();

    return NextResponse.json(successful);
  } catch (err) {
    console.error("Failed to read quest history:", err);
    return NextResponse.json([], { status: 200 });
  }
}
