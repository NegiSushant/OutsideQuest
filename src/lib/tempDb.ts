import { promises as fs } from "fs";
import path from "path";
import { CompletedQuest } from "./types";

const LOG_FILE = path.join(process.cwd(), "final-quest.json");

export async function saveFinalQuest(entry: CompletedQuest) {
  try {
    let logs: CompletedQuest[] = [];
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
