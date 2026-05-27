"use client";

import { useState } from "react";
import { cx, ui } from "@/components/ui/styles";
import { runRefineAgent } from "@/features/ai/ai.api";
import type { RefineTaskResult } from "@/features/ai/refine.types";
import type { TaskDto } from "@/features/tasks/task.types";

type RefinePanelProps = {
  selectedTask: TaskDto | null;
};

export function RefinePanel({ selectedTask }: RefinePanelProps) {
  const [result, setResult] = useState<RefineTaskResult | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRefine() {
    if (!selectedTask) {
      setError("Select a task to refine first.");
      return;
    }
    setIsRefining(true);
    setError(null);
    setResult(null);
    try {
      setResult(await runRefineAgent(selectedTask.title, selectedTask.description));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refine task");
    } finally {
      setIsRefining(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleRefine}
        disabled={!selectedTask || isRefining}
        className={cx(
          "w-full rounded-xl border border-purple-400/30 bg-purple-400/10",
          "px-5 py-3 text-sm font-semibold text-purple-300 transition-all duration-200",
          "hover:bg-purple-400/20 hover:border-purple-400/50 active:scale-[0.98]",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        {isRefining ? "✨ Refining…" : "✨ Refine selected task"}
      </button>

      {error ? <div className={ui.alertError}>{error}</div> : null}

      {result ? (
        <div className="space-y-3">
          <div className={ui.panelNested}>
            <p className={ui.metaLabel}>✨ Refined Task</p>
            <p className="mt-2 font-semibold text-white">{result.title}</p>
            <div className="mt-3 whitespace-pre-wrap rounded bg-black/20 border border-white/5 p-4 text-sm leading-6 text-slate-300">
              {result.description}
            </div>
            <button
              type="button"
              className={cx("mt-3", ui.accentButton)}
              onClick={() =>
                navigator.clipboard.writeText(`${result.title}\n\n${result.description}`)
              }
            >
              Copy to clipboard
            </button>
          </div>

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
