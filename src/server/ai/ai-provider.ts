import type { z } from "zod";

import type { AiProviderHealth, AiProviderId } from "@/features/ai/ai.types";

export type AiGenerateJsonInput<T> = {
  schemaName: string;
  system: string;
  user: string;
  schema: z.ZodType<T>;
  mockResponse: T;
};

export interface AiProvider {
  readonly id: AiProviderId;

  health(): AiProviderHealth;

  generateJson<T>(input: AiGenerateJsonInput<T>): Promise<T>;
}

export class AiProviderError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "AiProviderError";
  }
}
