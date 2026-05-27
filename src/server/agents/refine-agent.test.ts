import { beforeEach, describe, expect, it, vi } from "vitest";

import { getAiProvider } from "@/server/ai/get-ai-provider";
import { makeMockProvider } from "./__fixtures__/agent.fixtures";

import { runRefineAgent } from "./refine-agent";

vi.mock("@/server/ai/get-ai-provider", () => ({
  getAiProvider: vi.fn(),
}));

const mockGetAiProvider = vi.mocked(getAiProvider);

describe("runRefineAgent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAiProvider.mockReturnValue(makeMockProvider());
  });

  it("returns a refined task structure for a vague input", async () => {
    const result = await runRefineAgent({
      title: "fix button",
      description: "it looks bad",
    });

    expect(result.title).toContain("[Refined] fix button");
    expect(result.description).toContain("Problem:");
    expect(result.agentSteps.length).toBeGreaterThan(0);
    expect(result.generatedAt).toBeDefined();
  });

  it("handles empty title with a placeholder", async () => {
    const result = await runRefineAgent({ title: "", description: "" });

    expect(result.title).toContain("Untitled Task");
    expect(result.description).toBeDefined();
  });

  it("calls the AI provider once", async () => {
    const provider = makeMockProvider();
    mockGetAiProvider.mockReturnValue(provider);

    await runRefineAgent({ title: "something", description: "do the thing here please" });

    expect(provider.generateJson).toHaveBeenCalledTimes(1);
  });
});
