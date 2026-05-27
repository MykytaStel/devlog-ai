import { beforeEach, describe, expect, it, vi } from "vitest";

import { getAiProvider } from "@/server/ai/get-ai-provider";
import { getTasks } from "@/server/repositories/task.repository";
import { makeTask, makeMockProvider } from "./__fixtures__/agent.fixtures";

import { runPrioritizationAgent } from "./prioritization-agent";

vi.mock("@/server/repositories/task.repository", () => ({
  getTasks: vi.fn(),
}));

vi.mock("@/server/ai/get-ai-provider", () => ({
  getAiProvider: vi.fn(),
}));

const mockGetTasks = vi.mocked(getTasks);
const mockGetAiProvider = vi.mocked(getAiProvider);

describe("runPrioritizationAgent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAiProvider.mockReturnValue(makeMockProvider());
  });

  it("excludes done tasks and flags vague actionable work", async () => {
    mockGetTasks.mockResolvedValue([
      makeTask({
        id: "done-task",
        title: "Already shipped",
        status: "done",
        priority: "high",
      }),
      makeTask({
        id: "vague-task",
        title: "Fix",
        description: "fix bug",
        status: "todo",
        priority: "low",
      }),
      makeTask({
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

  it("returns empty plan when there are no tasks", async () => {
    mockGetTasks.mockResolvedValue([]);

    const result = await runPrioritizationAgent();

    expect(result.recommendedTasks).toHaveLength(0);
    expect(result.contextStats.totalTasks).toBe(0);
    expect(mockGetAiProvider).not.toHaveBeenCalled();
  });

  it("returns all-done plan when every task is done", async () => {
    mockGetTasks.mockResolvedValue([
      makeTask({ id: "d1", status: "done", priority: "high" }),
      makeTask({ id: "d2", status: "done", priority: "medium" }),
    ]);

    const result = await runPrioritizationAgent();

    expect(result.recommendedTasks).toHaveLength(0);
    expect(result.contextStats.doneTasks).toBe(2);
    expect(mockGetAiProvider).not.toHaveBeenCalled();
  });
});
