const defaultModel = process.env.MODEL || "ai/gemma3:1b-q4_K_M";
const baseUrl = process.env.BASE_URL || "http://localhost:12434/engines/v1";

export const config = {
  defaultModel,
  baseUrl,
};

