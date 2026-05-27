import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";

import {
  AiProviderError,
  type AiGenerateJsonInput,
  type AiProvider,
} from "./ai-provider";

type OpenAiProviderOptions = {
  apiKey?: string;
  model?: string;
};

export class OpenAiProvider implements AiProvider {
  readonly id = "openai" as const;

  private readonly client: OpenAI | null;
  private readonly model: string;

  constructor(options: OpenAiProviderOptions = {}) {
    const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;
    this.model = options.model ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini";

    this.client = apiKey ? new OpenAI({ apiKey }) : null;
  }

  health() {
    return {
      provider: this.id,
      configured: Boolean(this.client),
      model: this.model,
    };
  }

  async generateJson<T>(input: AiGenerateJsonInput<T>): Promise<T> {
    if (!this.client) {
      throw new AiProviderError(
        "OpenAI provider is selected, but OPENAI_API_KEY is not configured"
      );
    }

    try {
      const completion = await this.client.chat.completions.parse({
        model: this.model,
        temperature: 0.2,
        response_format: zodResponseFormat(input.schema, input.schemaName),
        messages: [
          {
            role: "system",
            content: [
              input.system,
              "",
              "Return only the requested structured response.",
              "Be concise and specific.",
            ].join("\n"),
          },
          {
            role: "user",
            content: input.user,
          },
        ],
      });

      const parsed = completion.choices[0]?.message.parsed;

      if (!parsed) {
        throw new AiProviderError("OpenAI returned an empty structured response");
      }

      return input.schema.parse(parsed);
    } catch (error) {
      if (error instanceof AiProviderError) {
        throw error;
      }

      throw new AiProviderError("Failed to generate structured AI response", error);
    }
  }
}
