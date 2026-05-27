import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AiProvider } from "@/server/ai/ai-provider";
import { getAiProvider } from "@/server/ai/get-ai-provider";
import { getTaskById } from "@/server/repositories/task.repository";
import type { TaskWithSubtasksDto } from "@/features/tasks/task.types";

import { runDecompositionAgent } from "./decomposition-agent";

vi.mock("@/server/repositories/task.repository", () => ({
  getTaskById: vi.fn(),
}));

vi.mock("@/server/ai/get-ai-provider", () => ({
  getAiProvider: vi.fn(),
}));

const mockGetTaskById = vi.mocked(getTaskById);
const mockGetAiProvider = vi.mocked(getAiProvider);

function task(overrides: Partial<TaskWithSubtasksDto>): TaskWithSubtasksDto {
  return {
    id: "task-1",
    title: "Build decomposition agent",
    description:
      "Create an agent that loads task context, checks clarity, and generates structured subtasks.",
    status: "todo",
    priority: "high",
    parentId: null,
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z",
    subtasks: [],
    ...overrides,
  };
}

function mockProvider(): AiProvider {
  return {
    id: "mock",
    health: () => ({
      provider: "mock",
      configured: true,
      model: "mock",
    }),
    generateJson: vi.fn(async (input) => input.mockResponse),
  };
}

describe("runDecompositionAgent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAiProvider.mockReturnValue(mockProvider());
  });

  it("asks for clarification before decomposing vague tasks", async () => {
    mockGetTaskById.mockResolvedValue(
      task({
        title: "Fix",
        description: "fix bug",
      })
    );

    const result = await runDecompositionAgent({ taskId: "task-1" });

    expect(result.type).toBe("clarification_needed");
    expect(result.agentSteps).toContain(
      'Detected that "Fix" does not contain enough context for safe decomposition.'
    );
    expect(mockGetAiProvider).not.toHaveBeenCalled();
  });

  it("returns structured subtasks for clear tasks", async () => {
    mockGetTaskById.mockResolvedValue(task({}));

    const result = await runDecompositionAgent({ taskId: "task-1" });

    expect(result.type).toBe("subtasks");

    if (result.type === "subtasks") {
      expect(result.subtasks.length).toBeGreaterThan(0);
      expect(result.subtasks[0]?.title).toContain("Build decomposition agent");
    }

    expect(mockGetAiProvider).toHaveBeenCalledTimes(1);
  });
});
