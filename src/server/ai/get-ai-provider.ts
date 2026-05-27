import type { AiProviderId } from "@/features/ai/ai.types";

import type { AiProvider } from "./ai-provider";
import { MockAiProvider } from "./mock-ai-provider";
import { OpenAiProvider } from "./openai-provider";

function resolveProviderId(): AiProviderId {
  const value = process.env.AI_PROVIDER;

  if (value === "openai") {
    return "openai";
  }

  return "mock";
}

export function getAiProvider(): AiProvider {
  const providerId = resolveProviderId();

  if (providerId === "openai") {
    return new OpenAiProvider();
  }

  return new MockAiProvider();
}
