import { beforeEach, describe, expect, it, vi } from "vitest";

import { getAiProvider } from "@/server/ai/get-ai-provider";
import { getTaskById } from "@/server/repositories/task.repository";
import { makeTaskWithSubtasks, makeMockProvider } from "./__fixtures__/agent.fixtures";

import { runDecompositionAgent } from "./decomposition-agent";

vi.mock("@/server/repositories/task.repository", () => ({
  getTaskById: vi.fn(),
}));

vi.mock("@/server/ai/get-ai-provider", () => ({
  getAiProvider: vi.fn(),
}));

const mockGetTaskById = vi.mocked(getTaskById);
const mockGetAiProvider = vi.mocked(getAiProvider);

describe("runDecompositionAgent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAiProvider.mockReturnValue(makeMockProvider());
  });

  it("asks for clarification before decomposing vague tasks", async () => {
    mockGetTaskById.mockResolvedValue(
      makeTaskWithSubtasks({
        title: "Fix",
        description: "fix bug",
      })
    );

    const result = await runDecompositionAgent({ taskId: "task-1" });

    expect(result.type).toBe("clarification_needed");
    expect(result.agentSteps).toContain(
      'Detected that "Fix" does not contain enough context for safe decomposition.'
    );
    // Should short-circuit before calling the AI provider
    expect(mockGetAiProvider).not.toHaveBeenCalled();
  });

  it("returns structured subtasks for clear tasks", async () => {
    mockGetTaskById.mockResolvedValue(makeTaskWithSubtasks({
      title: "Build decomposition agent",
      description:
        "Create an agent that loads task context, checks clarity, and generates structured subtasks.",
    }));

    const result = await runDecompositionAgent({ taskId: "task-1" });

    expect(result.type).toBe("subtasks");

    if (result.type === "subtasks") {
      expect(result.subtasks.length).toBeGreaterThan(0);
      expect(result.subtasks[0]?.title).toContain("Build decomposition agent");
    }

    expect(mockGetAiProvider).toHaveBeenCalledTimes(1);
  });

  it("returns structured subtasks for clear tasks with short descriptions", async () => {
    mockGetTaskById.mockResolvedValue(makeTaskWithSubtasks({
      title: "Add dark mode toggle",
      description: "User preference stored in localStorage",
    }));

    const result = await runDecompositionAgent({ taskId: "task-1" });
    expect(result.type).toBe("subtasks");
    expect(mockGetAiProvider).toHaveBeenCalledTimes(1);
  });

  it("asks for clarification for tasks with short titles and no description", async () => {
    mockGetTaskById.mockResolvedValue(
      makeTaskWithSubtasks({
        title: "Fix bug",
        description: "",
      })
    );

    const result = await runDecompositionAgent({ taskId: "task-2" });
    expect(result.type).toBe("clarification_needed");
    expect(mockGetAiProvider).not.toHaveBeenCalled();
  });

  it("throws when task is not found", async () => {
    mockGetTaskById.mockResolvedValue(null);

    await expect(
      runDecompositionAgent({ taskId: "nonexistent" })
    ).rejects.toThrow("Task not found");
  });
});

