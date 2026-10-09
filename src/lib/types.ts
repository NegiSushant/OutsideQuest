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
  availableTime: number;
  mood: Mood;
  environment: Environment;
  isSurprise?: boolean;
  notes?: string;
}

/** A single concrete task inside a quest */
export interface QuestTask {
  id: string;
  description: string;
  estimatedMinutes?: number;
}

/** AI / system generated quest */
export interface GeneratedQuest {
  id: string;
  title: string;
  duration: number;
  description?: string;
  tasks: QuestTask[];
  tags?: string[];
  generatedAt: string;
  basedOn: UserPreferences;

  // runtime / progress fields
  status?: QuestStatus;
  startedAt?: string; // ISO
  remainingSeconds?: number;
  lastPausedAt?: string;

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
  reflection?: string;
  moodBefore?: Mood;
  moodAfter?: Mood;
  completedAt?: string;
  startedAt?: string;
  minutesOutside?: number;
  proofUrl?: string;
}

/** Shape of everything we persist */
export interface AppData {
  preferences: UserPreferences | null;
  activeQuest: GeneratedQuest | null;
  completedQuests: CompletedQuest[];
  totalMinutesOutside: number;
}
