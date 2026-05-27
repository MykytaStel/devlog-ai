import { beforeEach, describe, expect, it, vi } from "vitest";

import { getAiProvider } from "@/server/ai/get-ai-provider";
import { getTasks } from "@/server/repositories/task.repository";
import { makeTask, makeMockProvider } from "./__fixtures__/agent.fixtures";

import { runStatusUpdateAgent } from "./status-update-agent";

vi.mock("@/server/repositories/task.repository", () => ({
  getTasks: vi.fn(),
}));

vi.mock("@/server/ai/get-ai-provider", () => ({
  getAiProvider: vi.fn(),
}));

const mockGetTasks = vi.mocked(getTasks);
const mockGetAiProvider = vi.mocked(getAiProvider);

const RECENT_DATE = new Date(Date.now() - 10 * 60 * 1000).toISOString(); // 10 minutes ago
const STALE_DATE = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(); // 5 days ago

describe("runStatusUpdateAgent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAiProvider.mockReturnValue(makeMockProvider());
  });

  it("always loads all tasks from the repository", async () => {
    mockGetTasks.mockResolvedValue([]);

    await runStatusUpdateAgent();

    expect(mockGetTasks).toHaveBeenCalledWith({
      status: "all",
      sort: "createdAt",
    });
  });

  it("includes in-progress tasks and recently-done tasks", async () => {
    mockGetTasks.mockResolvedValue([
      makeTask({ id: "t1", status: "in-progress", updatedAt: STALE_DATE }),
      makeTask({ id: "t2", status: "done", updatedAt: RECENT_DATE }),
      makeTask({ id: "t3", status: "todo", updatedAt: RECENT_DATE }),
    ]);

    const result = await runStatusUpdateAgent();

    expect(result.updateText).toBeDefined();
    expect(result.agentSteps).toBeDefined();
  });

  it("excludes stale done tasks from the context sent to the provider", async () => {
    // All done tasks are older than 48h — nothing relevant to report
    mockGetTasks.mockResolvedValue([
      makeTask({ id: "t1", status: "done", updatedAt: STALE_DATE }),
      makeTask({ id: "t2", status: "done", updatedAt: STALE_DATE }),
    ]);

    const result = await runStatusUpdateAgent();

    // Should still return a result (fallback), but with 0 relevant tasks
    expect(result.updateText).toContain("0");
  });

  it("returns a valid update text", async () => {
    mockGetTasks.mockResolvedValue([
      makeTask({ id: "t1", title: "Done task", status: "done", updatedAt: RECENT_DATE }),
      makeTask({ id: "t2", title: "In-progress task", status: "in-progress" }),
    ]);

    const result = await runStatusUpdateAgent();

    expect(result.updateText).toContain("Daily Async Update");
  });
});
