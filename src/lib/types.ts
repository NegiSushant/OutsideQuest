export type QuestStatus = "not_started" | "ongoing" | "completed";

/** How the user is feeling right now */
export type Mood =
  | "relax"
  | "explore"
  | "anxious"
  | "bored"
  | "curious"
  | "calm"
  | "adventurous"
  | "reflective"
  | "move"
  | "create"
  | "nature";

/** Preferred setting / context for the quest */
export type Environment =
  | "outdoors"
  | "park"
  | "urban"
  | "home"
  | "any"
  | "nature"
  | "quiet-spot"
  | "mixed";

/** User preferences used to generate a quest */
export interface UserPreferences {
  availableTime: number; /** Available time in minutes */
  mood: Mood;
  environment: Environment;
  isSurprise?: boolean; /** Whether this was a “Surprise Me” generation */
  notes?: string; /** Whether this was a “Surprise Me” generation */
}

/** A single concrete task inside a quest */
export interface QuestTask {
  id: string;
  description: string;
  /** Optional estimated minutes for this task */
  estimatedMinutes?: number;
}

/** AI / system generated quest */
export interface GeneratedQuest {
  id: string;
  title: string;
  duration: number; /**Total suggested duration in minutes*/
  description?: string;
  tasks: QuestTask[];
  tags?: string[]; /** Tags for filtering / display */
  generatedAt: string; /** When this quest was generated (ISO string) */
  basedOn: UserPreferences; /** The preferences that produced this quest */

  // runtime / progress fields
  status?: QuestStatus;
  startedAt?: string; // ISO
  remainingSeconds?: number; // for resume
  lastPausedAt?: string; // ISO – when modal was closed

  // reflection fields
  reflection?: string;
  moodBefore?: Mood;
  moodAfter?: Mood;
  minutesOutside?: number;
  completedAt?: string;
}

/** A quest the user has finished */
export interface CompletedQuest {
  questId: string;
  quest: GeneratedQuest;
  reflection?: string; /** User’s free-text reflection after finishing */
  moodBefore?: Mood;
  moodAfter?: Mood;
  completedAt?: string; /** When the user marked it complete (ISO string) */
  startedAt?: string;
  minutesOutside?: number; /** Actual minutes spent outside / on the quest */
  proofUrl?: string; /** Optional photo / proof URL (base64 or remote) */
}

/** Shape of everything we persist */
export interface AppData {
  preferences: UserPreferences | null;
  /** Currently active (accepted but not completed) quest */
  activeQuest: GeneratedQuest | null;
  completedQuests: CompletedQuest[];
  /** Lifetime total minutes spent outside */
  totalMinutesOutside: number;
}
