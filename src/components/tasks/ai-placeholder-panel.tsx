"use client";

import { useState } from "react";

import { cx, ui } from "@/components/ui/styles";
import {
  createGeneratedSubtasks,
  runDecomposition,
  runPrioritization,
  runStatusUpdate,
} from "@/features/ai/ai.api";
import type { DecompositionResult } from "@/features/ai/decomposition.types";
import type { PrioritizationResult } from "@/features/ai/prioritization.types";
import type { StatusUpdateResult } from "@/features/ai/status.types";
import type { TaskDto } from "@/features/tasks/task.types";

type AiPlaceholderPanelProps = {
  selectedTask: TaskDto | null;
  onClearSelectedTask: () => void;
  onSubtasksCreated: () => Promise<void>;
};

type CreatedSubtasksSummary = {
  parentTitle: string;
  createdCount: number;
  totalSubtasks: number;
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
  const [statusUpdateResult, setStatusUpdateResult] =
    useState<StatusUpdateResult | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [isDecomposing, setIsDecomposing] = useState(false);
  const [isGeneratingStatus, setIsGeneratingStatus] = useState(false);
  const [isCreatingSubtasks, setIsCreatingSubtasks] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdSubtasksSummary, setCreatedSubtasksSummary] =
    useState<CreatedSubtasksSummary | null>(null);

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
    setCreatedSubtasksSummary(null);

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

  async function handleGenerateStatus() {
    setIsGeneratingStatus(true);
    setErrorMessage(null);
    setStatusUpdateResult(null);

    try {
      const nextResult = await runStatusUpdate();
      setStatusUpdateResult(nextResult);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to generate status update"
      );
    } finally {
      setIsGeneratingStatus(false);
    }
  }

  async function handleCreateSubtasks() {
    if (!selectedTask || decompositionResult?.type !== "subtasks") {
      return;
    }

    setIsCreatingSubtasks(true);
    setErrorMessage(null);

    try {
      const createdCount = decompositionResult.subtasks.length;
      const updatedTask = await createGeneratedSubtasks(
        selectedTask.id,
        decompositionResult.subtasks
      );

      await onSubtasksCreated();
      setCreatedSubtasksSummary({
        parentTitle: updatedTask.title,
        createdCount,
        totalSubtasks: updatedTask.subtasks.length,
      });
      setDecompositionResult(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to create subtasks"
      );
    } finally {
      setIsCreatingSubtasks(false);
    }
  }

  function handleClearSelection() {
    setDecompositionResult(null);
    setCreatedSubtasksSummary(null);
    setErrorMessage(null);
    onClearSelectedTask();
  }

  return (
    <section id="ai-panel" className={ui.aiPanel}>
      <p className={ui.overline}>AI Agent Layer</p>

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
          className={ui.primaryButton}
        >
          {isPlanning ? "Planning..." : "Plan my day"}
        </button>

        <button
          type="button"
          onClick={handleGenerateStatus}
          disabled={isGeneratingStatus}
          className={ui.secondaryButton}
        >
          {isGeneratingStatus ? "Generating..." : "Generate Standup Update"}
        </button>

        <div className={ui.panelNested}>
          <p className="text-sm font-medium text-white">Selected task</p>
          {selectedTask ? (
            <div className="mt-2">
              <p className="text-sm text-cyan-100">{selectedTask.title}</p>
              <button
                type="button"
                onClick={handleClearSelection}
                className={ui.linkButton}
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
            className={cx("mt-4", ui.accentButtonFull)}
          >
            {isDecomposing ? "Decomposing..." : "Decompose selected task"}
          </button>
        </div>
      </div>

      {errorMessage ? (
        <div className={cx("mt-4", ui.alertError)}>
          {errorMessage}
        </div>
      ) : null}

      {createdSubtasksSummary ? (
        <div className={cx("mt-4", ui.alertSuccess)}>
          <p className="text-sm font-medium text-emerald-100">
            Subtasks created
          </p>
          <p className="mt-2 text-sm leading-6 text-emerald-50">
            Created {createdSubtasksSummary.createdCount} subtasks for &quot;
            {createdSubtasksSummary.parentTitle}&quot;. The parent task now has{" "}
            {createdSubtasksSummary.totalSubtasks} subtasks, and they are
            visible in the task list with the Subtask label.
          </p>
        </div>
      ) : null}

      {prioritizationResult ? (
        <div className="mt-5 space-y-4">
          <div className={ui.panelNested}>
            <p className={ui.metaLabel}>Day plan</p>
            <p className="mt-2 text-sm leading-6 text-white">
              {prioritizationResult.summary}
            </p>
          </div>

          {prioritizationResult.recommendedTasks.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-white">Recommended order</p>
              {prioritizationResult.recommendedTasks.map((task) => (
                <div key={task.taskId} className={ui.panelNested}>
                  <div className="flex items-start gap-3">
                    <span className={ui.rankBadge}>{task.rank}</span>
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

          <details className={ui.panelNested}>
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

      {statusUpdateResult ? (
        <div className="mt-5 space-y-4">
          <div className={ui.panelNested}>
            <p className={ui.metaLabel}>Standup Update</p>
            <div className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white rounded bg-black/20 p-4 border border-white/5">
              {statusUpdateResult.updateText}
            </div>
            <button
              type="button"
              className={cx("mt-3", ui.accentButton)}
              onClick={() => navigator.clipboard.writeText(statusUpdateResult.updateText)}
            >
              Copy to clipboard
            </button>
          </div>

          <details className={ui.panelNested}>
            <summary className="cursor-pointer text-sm font-medium text-slate-300">
              Status update agent steps
            </summary>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-400">
              {statusUpdateResult.agentSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </details>
        </div>
      ) : null}

      {decompositionResult ? (
        <div className="mt-5 space-y-4">
          {decompositionResult.type === "clarification_needed" ? (
            <div className={ui.alertWarning}>
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
              <div className={ui.panelNested}>
                <p className={ui.metaLabel}>Decomposition</p>
                <p className="mt-2 text-sm leading-6 text-white">
                  {decompositionResult.summary}
                </p>
              </div>

              {decompositionResult.subtasks.map((subtask) => (
                <div
                  key={`${subtask.title}-${subtask.priority}`}
                  className={ui.panelNested}
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
                className={ui.primaryButton}
              >
                {isCreatingSubtasks ? "Creating subtasks..." : "Create subtasks"}
              </button>
            </div>
          )}

          <details className={ui.panelNested}>
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
