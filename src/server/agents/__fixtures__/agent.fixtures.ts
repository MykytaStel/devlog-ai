import { vi } from "vitest";
import type { AiProvider } from "@/server/ai/ai-provider";
import type { TaskDto, TaskWithSubtasksDto } from "@/features/tasks/task.types";

export function makeTask(overrides: Partial<TaskDto> = {}): TaskDto {
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

export function makeTaskWithSubtasks(
  overrides: Partial<TaskWithSubtasksDto> = {}
): TaskWithSubtasksDto {
  return {
    ...makeTask(overrides),
    subtasks: [],
    ...overrides,
  };
}

export function makeMockProvider(): AiProvider {
  return {
    id: "mock",
    health: () => ({ provider: "mock", configured: true, model: "mock" }),
    generateJson: vi.fn(async (input) => input.mockResponse),
  };
}
