import type { TaskDto, TaskPriority, TaskStatus } from "@/features/tasks/task.types";

export type TaskSignal = {
  task: TaskDto;
  ageDays: number;
  score: number;
  signals: string[];
};

export const AI_TASK_CONTEXT_LIMIT = 12;

export const priorityScore: Record<TaskPriority, number> = {
  high: 30,
  medium: 15,
  low: 5,
};

export const statusScore: Record<TaskStatus, number> = {
  "in-progress": 20,
  todo: 10,
  done: -100,
};

export function getAgeDays(createdAt: string): number {
  const created = new Date(createdAt).getTime();

  if (Number.isNaN(created)) {
    return 0;
  }

  const diffMs = Date.now() - created;
  const dayMs = 24 * 60 * 60 * 1000;

  return Math.max(0, Math.floor(diffMs / dayMs));
}

export function describePriority(priority: TaskPriority): string {
  if (priority === "high") return "high priority";
  if (priority === "medium") return "medium priority";
  return "low priority";
}

export function describeStatus(status: TaskStatus): string {
  if (status === "in-progress") return "already in progress";
  if (status === "todo") return "not started yet";
  return "already done";
}

export function scoreTask(task: TaskDto): TaskSignal {
  const ageDays = getAgeDays(task.createdAt);
  const ageScore = Math.min(20, ageDays * 2);
  const clarityPenalty = task.description.trim().length < 40 ? -5 : 0;

  const score =
    priorityScore[task.priority] +
    statusScore[task.status] +
    ageScore +
    clarityPenalty;

  const signals = [
    describePriority(task.priority),
    describeStatus(task.status),
    `${ageDays} day(s) old`,
  ];

  if (ageDays >= 7) {
    signals.push("older task that may need attention");
  }

  if (task.description.trim().length < 40) {
    signals.push("description may be too vague");
  }

  return { task, ageDays, score, signals };
}
