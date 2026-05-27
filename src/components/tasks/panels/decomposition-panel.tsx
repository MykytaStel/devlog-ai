"use client";

import { useState } from "react";
import { cx, ui } from "@/components/ui/styles";
import { createGeneratedSubtasks, runDecomposition } from "@/features/ai/ai.api";
import type { DecompositionResult } from "@/features/ai/decomposition.types";
import type { TaskDto } from "@/features/tasks/task.types";

type DecompositionPanelProps = {
  selectedTask: TaskDto | null;
  onSubtasksCreated: () => Promise<void>;
};

type CreatedSubtasksSummary = {
  parentTitle: string;
  createdCount: number;
  totalSubtasks: number;
};

export function DecompositionPanel({
  selectedTask,
  onSubtasksCreated,
}: DecompositionPanelProps) {
  const [result, setResult] = useState<DecompositionResult | null>(null);
  const [isDecomposing, setIsDecomposing] = useState(false);
  const [isCreatingSubtasks, setIsCreatingSubtasks] = useState(false);
  const [summary, setSummary] = useState<CreatedSubtasksSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDecompose() {
    if (!selectedTask) {
      setError("Select a task to decompose first.");
      return;
    }
    setIsDecomposing(true);
    setError(null);
    setResult(null);
    setSummary(null);
    try {
      setResult(await runDecomposition(selectedTask.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to decompose task");
    } finally {
      setIsDecomposing(false);
    }
  }

  async function handleCreateSubtasks() {
    if (!selectedTask || result?.type !== "subtasks") return;
    setIsCreatingSubtasks(true);
    setError(null);
    try {
      const createdCount = result.subtasks.length;
      const updatedTask = await createGeneratedSubtasks(selectedTask.id, result.subtasks);
      await onSubtasksCreated();
      setSummary({
        parentTitle: updatedTask.title,
        createdCount,
        totalSubtasks: updatedTask.subtasks.length,
      });
      setResult(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create subtasks");
    } finally {
      setIsCreatingSubtasks(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleDecompose}
        disabled={!selectedTask || isDecomposing}
        className={ui.accentButtonFull}
      >
        {isDecomposing ? "Decomposing…" : "Decompose selected task"}
      </button>

      {error ? <div className={cx(ui.alertError)}>{error}</div> : null}

      {summary ? (
        <div className={ui.alertSuccess}>
          <p className="text-sm font-medium text-emerald-100">Subtasks created</p>
          <p className="mt-2 text-sm leading-6 text-emerald-50">
            Created {summary.createdCount} subtasks for &quot;{summary.parentTitle}&quot;.
            The parent task now has {summary.totalSubtasks} subtasks visible in the list.
          </p>
        </div>
      ) : null}

      {result ? (
        <div className="space-y-3">
          {result.type === "clarification_needed" ? (
            <div className={ui.alertWarning}>
              <p className="text-sm font-medium text-amber-100">Clarification needed</p>
              <p className="mt-2 text-sm leading-6 text-amber-50">{result.question}</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-amber-50/90">
                {result.missingContext.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          ) : (
            <div className="space-y-3">
              <div className={ui.panelNested}>
                <p className={ui.metaLabel}>Decomposition</p>
                <p className="mt-2 text-sm leading-6 text-white">{result.summary}</p>
              </div>

              {result.subtasks.map((subtask) => (
                <div
                  key={`${subtask.title}-${subtask.priority}`}
                  className={ui.panelNested}
                >
                  <p className="font-medium text-white">{subtask.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{subtask.description}</p>
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
                {isCreatingSubtasks ? "Creating subtasks…" : "Create subtasks"}
              </button>
            </div>
          )}

          <details className={ui.panelNested}>
            <summary className="cursor-pointer text-sm font-medium text-slate-300">
              Agent steps
            </summary>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-400">
              {result.agentSteps.map((step) => <li key={step}>{step}</li>)}
            </ol>
          </details>
        </div>
      ) : null}
    </div>
  );
}
