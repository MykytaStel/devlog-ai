"use client";

import { useState } from "react";

import {
  createGeneratedSubtasks,
  runDecomposition,
  runPrioritization,
} from "@/features/ai/ai.api";
import type { DecompositionResult } from "@/features/ai/decomposition.types";
import type { PrioritizationResult } from "@/features/ai/prioritization.types";
import type { TaskDto } from "@/features/tasks/task.types";

type AiPlaceholderPanelProps = {
  selectedTask: TaskDto | null;
  onClearSelectedTask: () => void;
  onSubtasksCreated: () => Promise<void>;
};

export function AiPlaceholderPanel({
  selectedTask,
  onClearSelectedTask,
  onSubtasksCreated,
}: AiPlaceholderPanelProps) {
  const [prioritizationResult, setPrioritizationResult] =
    useState<PrioritizationResult | null>(null);
  const [decompositionResult, setDecompositionResult] =
    useState<DecompositionResult | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [isDecomposing, setIsDecomposing] = useState(false);
  const [isCreatingSubtasks, setIsCreatingSubtasks] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handlePlanDay() {
    setIsPlanning(true);
    setErrorMessage(null);

    try {
      const nextResult = await runPrioritization();
      setPrioritizationResult(nextResult);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to run AI planning"
      );
    } finally {
      setIsPlanning(false);
    }
  }

  async function handleDecompose() {
    if (!selectedTask) {
      setErrorMessage("Select a task to decompose first.");
      return;
    }

    setIsDecomposing(true);
    setErrorMessage(null);
    setDecompositionResult(null);

    try {
      const nextResult = await runDecomposition(selectedTask.id);
      setDecompositionResult(nextResult);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to decompose task"
      );
    } finally {
      setIsDecomposing(false);
    }
  }

  async function handleCreateSubtasks() {
    if (!selectedTask || decompositionResult?.type !== "subtasks") {
      return;
    }

    setIsCreatingSubtasks(true);
    setErrorMessage(null);

    try {
      await createGeneratedSubtasks(selectedTask.id, decompositionResult.subtasks);
      await onSubtasksCreated();
      setDecompositionResult(null);
      onClearSelectedTask();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to create subtasks"
      );
    } finally {
      setIsCreatingSubtasks(false);
    }
  }

  return (
    <section
      id="ai-panel"
      className="rounded-lg border border-cyan-300/20 bg-cyan-300/[0.06] p-5"
    >
      <p className="text-sm font-medium uppercase tracking-[0.22em] text-cyan-200">
        AI Agent Layer
      </p>

      <h2 className="mt-3 text-xl font-semibold text-white">
        Planning and decomposition
      </h2>

      <p className="mt-3 text-sm leading-6 text-slate-300">
        Agents load task context, make local decisions, call the AI provider,
        validate structured output, and return explainable results.
      </p>

      <div className="mt-5 grid gap-3">
        <button
          type="button"
          onClick={handlePlanDay}
          disabled={isPlanning}
          className="w-full rounded-lg bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPlanning ? "Planning..." : "Plan my day"}
        </button>

        <div className="rounded-lg border border-white/10 bg-slate-950/70 p-4">
          <p className="text-sm font-medium text-white">Selected task</p>
          {selectedTask ? (
            <div className="mt-2">
              <p className="text-sm text-cyan-100">{selectedTask.title}</p>
              <button
                type="button"
                onClick={onClearSelectedTask}
                className="mt-2 text-xs text-slate-400 underline-offset-4 hover:text-white hover:underline"
              >
                Clear selection
              </button>
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-400">
              Click “Break down” on any task card.
            </p>
          )}

          <button
            type="button"
            onClick={handleDecompose}
            disabled={!selectedTask || isDecomposing}
            className="mt-4 w-full rounded-lg border border-cyan-300/20 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDecomposing ? "Decomposing..." : "Decompose selected task"}
          </button>
        </div>
      </div>

      {errorMessage ? (
        <div className="mt-4 rounded-lg border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-100">
          {errorMessage}
        </div>
      ) : null}

      {prioritizationResult ? (
        <div className="mt-5 space-y-4">
          <div className="rounded-lg border border-white/10 bg-slate-950/70 p-4">
            <p className="text-xs uppercase tracking-widest text-slate-500">
              Day plan
            </p>
            <p className="mt-2 text-sm leading-6 text-white">
              {prioritizationResult.summary}
            </p>
          </div>

          {prioritizationResult.recommendedTasks.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-white">Recommended order</p>
              {prioritizationResult.recommendedTasks.map((task) => (
                <div
                  key={task.taskId}
                  className="rounded-lg border border-white/10 bg-slate-950/70 p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-cyan-300 text-sm font-bold text-slate-950">
                      {task.rank}
                    </span>
                    <div>
                      <p className="font-medium text-white">{task.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        {task.reason}
                      </p>
                      <p className="mt-2 text-sm text-cyan-100">
                        {task.suggestedAction}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <details className="rounded-lg border border-white/10 bg-slate-950/70 p-4">
            <summary className="cursor-pointer text-sm font-medium text-slate-300">
              Prioritization agent steps
            </summary>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-400">
              {prioritizationResult.agentSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </details>
        </div>
      ) : null}

      {decompositionResult ? (
        <div className="mt-5 space-y-4">
          {decompositionResult.type === "clarification_needed" ? (
            <div className="rounded-lg border border-amber-300/20 bg-amber-300/10 p-4">
              <p className="text-sm font-medium text-amber-100">
                Clarification needed
              </p>
              <p className="mt-2 text-sm leading-6 text-amber-50">
                {decompositionResult.question}
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-amber-50/90">
                {decompositionResult.missingContext.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-lg border border-white/10 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-widest text-slate-500">
                  Decomposition
                </p>
                <p className="mt-2 text-sm leading-6 text-white">
                  {decompositionResult.summary}
                </p>
              </div>

              {decompositionResult.subtasks.map((subtask) => (
                <div
                  key={`${subtask.title}-${subtask.priority}`}
                  className="rounded-lg border border-white/10 bg-slate-950/70 p-4"
                >
                  <p className="font-medium text-white">{subtask.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {subtask.description}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-widest text-cyan-200">
                    {subtask.priority} priority
                  </p>
                  <p className="mt-2 text-sm text-slate-400">{subtask.reason}</p>
                </div>
              ))}

              <button
                type="button"
                onClick={handleCreateSubtasks}
                disabled={isCreatingSubtasks}
                className="w-full rounded-lg bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCreatingSubtasks ? "Creating subtasks..." : "Create subtasks"}
              </button>
            </div>
          )}

          <details className="rounded-lg border border-white/10 bg-slate-950/70 p-4">
            <summary className="cursor-pointer text-sm font-medium text-slate-300">
              Decomposition agent steps
            </summary>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-400">
              {decompositionResult.agentSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </details>
        </div>
      ) : null}
    </section>
  );
}
