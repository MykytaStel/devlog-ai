import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AiProvider } from "@/server/ai/ai-provider";
import { getAiProvider } from "@/server/ai/get-ai-provider";
import { getTasks } from "@/server/repositories/task.repository";
import type { TaskDto } from "@/features/tasks/task.types";

import { runPrioritizationAgent } from "./prioritization-agent";

vi.mock("@/server/repositories/task.repository", () => ({
  getTasks: vi.fn(),
}));

vi.mock("@/server/ai/get-ai-provider", () => ({
  getAiProvider: vi.fn(),
}));

const mockGetTasks = vi.mocked(getTasks);
const mockGetAiProvider = vi.mocked(getAiProvider);

function task(overrides: Partial<TaskDto>): TaskDto {
  return {
    id: "task-1",
    title: "Build task tracker",
    description:
      "Create a local task tracker with validation, persistence, and a focused UI.",
    status: "todo",
    priority: "medium",
    parentId: null,
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z",
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

describe("runPrioritizationAgent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAiProvider.mockReturnValue(mockProvider());
  });

  it("excludes done tasks and flags vague actionable work", async () => {
    mockGetTasks.mockResolvedValue([
      task({
        id: "done-task",
        title: "Already shipped",
        status: "done",
        priority: "high",
      }),
      task({
        id: "vague-task",
        title: "Fix",
        description: "fix bug",
        status: "todo",
        priority: "low",
      }),
      task({
        id: "active-task",
        title: "Complete decomposition flow",
        status: "in-progress",
        priority: "medium",
      }),
    ]);

    const result = await runPrioritizationAgent();

    expect(result.recommendedTasks).toHaveLength(2);
    expect(result.recommendedTasks.map((item) => item.taskId)).not.toContain(
      "done-task"
    );
    expect(result.contextStats.doneTasks).toBe(1);
    expect(result.risks).toEqual(
      expect.arrayContaining([
        '"Fix" may need a clearer description before execution.',
      ])
    );
  });
});
