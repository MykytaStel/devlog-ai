import type { TaskDto } from "@/features/tasks/task.types";
import {
  prioritizationResultSchema,
  type PrioritizationResult,
} from "@/features/ai/prioritization.types";
import { getAiProvider } from "@/server/ai/get-ai-provider";
import { getTasks } from "@/server/repositories/task.repository";
import {
  AI_TASK_CONTEXT_LIMIT,
  scoreTask,
  type TaskSignal,
} from "./task-scoring";

// ─── Fallback (no AI provider call) ────────────────────────────────────────

function buildFallbackResult(signals: TaskSignal[]): PrioritizationResult {
  const actionableSignals = signals
    .filter((s) => s.task.status !== "done")
    .sort((a, b) => b.score - a.score);

  const recommendedTasks = actionableSignals.slice(0, 3).map((s, index) => ({
    rank: index + 1,
    taskId: s.task.id,
    title: s.task.title,
    reason: [`Score ${s.score}.`, `Signals: ${s.signals.join(", ")}.`].join(" "),
    suggestedAction:
      s.task.status === "in-progress"
        ? "Continue this task and push it closer to done."
        : "Start by clarifying the smallest next step and move it to in progress.",
  }));

  const doneTasks = signals.filter((s) => s.task.status === "done").length;
  const highPriorityTasks = signals.filter((s) => s.task.priority === "high").length;
  const staleTasks = signals.filter((s) => s.ageDays >= 7).length;

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
      .filter((s) => s.task.description.trim().length < 40)
      .slice(0, 2)
      .map((s) => `"${s.task.title}" may need a clearer description before execution.`),
  };
}

// ─── Prompt ─────────────────────────────────────────────────────────────────

function buildUserPrompt(signals: TaskSignal[]): string {
  const compactContext = [...signals]
    .sort((a, b) => b.score - a.score)
    .slice(0, AI_TASK_CONTEXT_LIMIT)
    .map((s) => ({
      id: s.task.id,
      title: s.task.title,
      description: s.task.description,
      status: s.task.status,
      priority: s.task.priority,
      createdAt: s.task.createdAt,
      ageDays: s.ageDays,
      computedScore: s.score,
      localSignals: s.signals,
    }));

  return [
    "You are helping an engineering team plan the next focused work block.",
    "",
    "Use the provided task context and local signals.",
    `Only the top ${AI_TASK_CONTEXT_LIMIT} highest-signal tasks are included when the workspace is large.`,
    "Do not simply pick the first high-priority task.",
    "Consider priority, status, age, description clarity, and execution flow.",
    "Completed tasks should not be recommended unless there is no other context.",
    "",
    "Task context:",
    JSON.stringify(compactContext, null, 2),
  ].join("\n");
}

// ─── Provider result normalization ──────────────────────────────────────────

function normalizeProviderResult(
  providerResult: PrioritizationResult,
  fallback: PrioritizationResult,
  knownTaskIds: Set<string>
): PrioritizationResult {
  const recommendedTasks = providerResult.recommendedTasks
    .filter((task) => knownTaskIds.has(task.taskId))
    .slice(0, 5)
    .map((task, index) => ({ ...task, rank: index + 1 }));

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

// ─── Agent entry point ───────────────────────────────────────────────────────

export async function runPrioritizationAgent(): Promise<PrioritizationResult> {
  const tasks: TaskDto[] = await getTasks({ status: "all", sort: "createdAt" });

  const signals = tasks.map(scoreTask);
  const fallback = buildFallbackResult(signals);

  if (signals.length === 0 || fallback.recommendedTasks.length === 0) {
    return fallback;
  }

  const provider = getAiProvider();
  const knownTaskIds = new Set(tasks.map((t) => t.id));

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
