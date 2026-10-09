import { config } from "./config";
import OpenAI from "openai";

const globalAI = globalThis as unknown as {
  dockerClient: OpenAI | undefined;
};

export const dockerAI =
  globalAI.dockerClient ??
  new OpenAI({
    baseURL: config.baseUrl,
    apiKey: "not-needed",
  });

if (process.env.NODE_ENV !== "production") {
  globalAI.dockerClient = dockerAI;
}
