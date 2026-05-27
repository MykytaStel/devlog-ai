import OpenAI from "openai";

import { AiProviderError, type AiGenerateJsonInput, type AiProvider } from "./ai-provider";

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
      const completion = await this.client.chat.completions.create({
        model: this.model,
        temperature: 0.2,
        response_format: {
          type: "json_object",
        },
        messages: [
          {
            role: "system",
            content: [
              input.system,
              "",
              "Return only valid JSON.",
              `The JSON object must match the expected schema: ${input.schemaName}.`,
              "Do not wrap the JSON in markdown.",
            ].join("\\n"),
          },
          {
            role: "user",
            content: input.user,
          },
        ],
      });

      const content = completion.choices[0]?.message?.content;

      if (!content) {
        throw new AiProviderError("OpenAI returned an empty response");
      }

      const parsedJson = JSON.parse(content);

      return input.schema.parse(parsedJson);
    } catch (error) {
      if (error instanceof AiProviderError) {
        throw error;
      }

      throw new AiProviderError("Failed to generate structured AI response", error);
    }
  }
}
