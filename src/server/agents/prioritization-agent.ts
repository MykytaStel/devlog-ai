import type { TaskDto, TaskPriority, TaskStatus } from "@/features/tasks/task.types";
import {
  prioritizationResultSchema,
  type PrioritizationResult,
} from "@/features/ai/prioritization.types";
import { getAiProvider } from "@/server/ai/get-ai-provider";
import { getTasks } from "@/server/repositories/task.repository";

type TaskSignal = {
  task: TaskDto;
  ageDays: number;
  score: number;
  signals: string[];
};

const priorityScore: Record<TaskPriority, number> = {
  high: 30,
  medium: 15,
  low: 5,
};

const statusScore: Record<TaskStatus, number> = {
  "in-progress": 20,
  todo: 10,
  done: -100,
};

function getAgeDays(createdAt: string) {
  const created = new Date(createdAt).getTime();

  if (Number.isNaN(created)) {
    return 0;
  }

  const diffMs = Date.now() - created;
  const dayMs = 24 * 60 * 60 * 1000;

  return Math.max(0, Math.floor(diffMs / dayMs));
}

function describePriority(priority: TaskPriority) {
  if (priority === "high") {
    return "high priority";
  }

  if (priority === "medium") {
    return "medium priority";
  }

  return "low priority";
}

function describeStatus(status: TaskStatus) {
  if (status === "in-progress") {
    return "already in progress";
  }

  if (status === "todo") {
    return "not started yet";
  }

  return "already done";
}

function scoreTask(task: TaskDto): TaskSignal {
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

  return {
    task,
    ageDays,
    score,
    signals,
  };
}

function buildFallbackResult(signals: TaskSignal[]): PrioritizationResult {
  const actionableSignals = signals
    .filter((signal) => signal.task.status !== "done")
    .sort((a, b) => b.score - a.score);

  const recommendedTasks = actionableSignals.slice(0, 3).map((signal, index) => ({
    rank: index + 1,
    taskId: signal.task.id,
    title: signal.task.title,
    reason: [
      `Score ${signal.score}.`,
      `Signals: ${signal.signals.join(", ")}.`,
    ].join(" "),
    suggestedAction:
      signal.task.status === "in-progress"
        ? "Continue this task and push it closer to done."
        : "Start by clarifying the smallest next step and move it to in progress.",
  }));

  const doneTasks = signals.filter((signal) => signal.task.status === "done").length;
  const highPriorityTasks = signals.filter(
    (signal) => signal.task.priority === "high"
  ).length;
  const staleTasks = signals.filter((signal) => signal.ageDays >= 7).length;

  if (signals.length === 0) {
    return {
      generatedAt: new Date().toISOString(),
      summary: "No tasks found. Create the first task before planning the day.",
      agentSteps: [
        "Loaded task context from the repository.",
        "Detected that the workspace has no tasks.",
        "Skipped LLM planning because there is no actionable context.",
      ],
      contextStats: {
        totalTasks: 0,
        actionableTasks: 0,
        doneTasks: 0,
        highPriorityTasks: 0,
        staleTasks: 0,
      },
      recommendedTasks: [],
      reasoning: ["There are no tasks to prioritize yet."],
      risks: ["The team has no visible work in DevLog yet."],
    };
  }

  if (recommendedTasks.length === 0) {
    return {
      generatedAt: new Date().toISOString(),
      summary: "All tasks are done. There is nothing urgent to start right now.",
      agentSteps: [
        "Loaded task context from the repository.",
        "Calculated priority, status, and age signals.",
        "Detected that every task is already done.",
      ],
      contextStats: {
        totalTasks: signals.length,
        actionableTasks: 0,
        doneTasks,
        highPriorityTasks,
        staleTasks,
      },
      recommendedTasks: [],
      reasoning: ["Completed tasks were intentionally excluded from the plan."],
      risks: ["No active tasks remain. The next step may be planning new work."],
    };
  }

  return {
    generatedAt: new Date().toISOString(),
    summary: `Start with "${recommendedTasks[0].title}", then continue with the next highest-impact tasks.`,
    agentSteps: [
      "Loaded all tasks from the repository.",
      "Calculated local signals for priority, status, age, and description clarity.",
      "Excluded completed work from the main recommendation set.",
      "Built a shortlist for the LLM/provider to turn into a human-readable plan.",
    ],
    contextStats: {
      totalTasks: signals.length,
      actionableTasks: actionableSignals.length,
      doneTasks,
      highPriorityTasks,
      staleTasks,
    },
    recommendedTasks,
    reasoning: [
      "In-progress tasks receive a boost because finishing active work usually reduces context switching.",
      "High-priority tasks receive the strongest priority signal.",
      "Older tasks receive an age boost so they do not stay invisible forever.",
    ],
    risks: actionableSignals
      .filter((signal) => signal.task.description.trim().length < 40)
      .slice(0, 2)
      .map((signal) => `"${signal.task.title}" may need a clearer description before execution.`),
  };
}

function buildUserPrompt(signals: TaskSignal[]) {
  const compactContext = signals.map((signal) => ({
    id: signal.task.id,
    title: signal.task.title,
    description: signal.task.description,
    status: signal.task.status,
    priority: signal.task.priority,
    createdAt: signal.task.createdAt,
    ageDays: signal.ageDays,
    computedScore: signal.score,
    localSignals: signal.signals,
  }));

  return [
    "You are helping an engineering team plan the next focused work block.",
    "",
    "Use the provided task context and local signals.",
    "Do not simply pick the first high-priority task.",
    "Consider priority, status, age, description clarity, and execution flow.",
    "Completed tasks should not be recommended unless there is no other context.",
    "",
    "Task context:",
    JSON.stringify(compactContext, null, 2),
  ].join("\n");
}

function normalizeProviderResult(
  providerResult: PrioritizationResult,
  fallback: PrioritizationResult,
  knownTaskIds: Set<string>
): PrioritizationResult {
  const recommendedTasks = providerResult.recommendedTasks
    .filter((task) => knownTaskIds.has(task.taskId))
    .slice(0, 5)
    .map((task, index) => ({
      ...task,
      rank: index + 1,
    }));

  if (recommendedTasks.length === 0 && fallback.recommendedTasks.length > 0) {
    return fallback;
  }

  return {
    ...providerResult,
    generatedAt: new Date().toISOString(),
    contextStats: fallback.contextStats,
    recommendedTasks,
    agentSteps:
      providerResult.agentSteps.length > 0
        ? providerResult.agentSteps
        : fallback.agentSteps,
  };
}

export async function runPrioritizationAgent(): Promise<PrioritizationResult> {
  const tasks = await getTasks({
    status: "all",
    sort: "createdAt",
  });

  const signals = tasks.map(scoreTask);
  const fallback = buildFallbackResult(signals);

  if (signals.length === 0 || fallback.recommendedTasks.length === 0) {
    return fallback;
  }

  const provider = getAiProvider();
  const knownTaskIds = new Set(tasks.map((task) => task.id));

  const result = await provider.generateJson({
    schemaName: "PrioritizationResult",
    schema: prioritizationResultSchema,
    mockResponse: fallback,
    system: [
      "You are a pragmatic engineering planning agent.",
      "Your job is to recommend what the team should start with today.",
      "You must return structured JSON only.",
      "Be concise, specific, and explain the decision logic.",
    ].join("\n"),
    user: buildUserPrompt(signals),
  });

  return normalizeProviderResult(result, fallback, knownTaskIds);
}
