import type { AiProvider } from "./ai-provider";
import type { AiGenerateJsonInput } from "./ai-provider";

export class MockAiProvider implements AiProvider {
  readonly id = "mock" as const;

  health() {
    return {
      provider: this.id,
      configured: true,
      model: "mock",
    };
  }

  async generateJson<T>(input: AiGenerateJsonInput<T>): Promise<T> {
    return input.schema.parse(input.mockResponse);
  }
}
