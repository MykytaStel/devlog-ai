"use client";

import { useState } from "react";
import { ui } from "@/components/ui/styles";
import { runPrioritization } from "@/features/ai/ai.api";
import type { PrioritizationResult } from "@/features/ai/prioritization.types";

export function PrioritizationPanel() {
  const [result, setResult] = useState<PrioritizationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePlanDay() {
    setIsLoading(true);
    setError(null);
    try {
      setResult(await runPrioritization());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run AI planning");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handlePlanDay}
        disabled={isLoading}
        className={ui.primaryButton}
      >
        {isLoading ? "Planning…" : "Plan my day"}
      </button>

      {error ? <div className={ui.alertError}>{error}</div> : null}

      {result ? (
        <div className="space-y-3">
          <div className={ui.panelNested}>
            <p className={ui.metaLabel}>Day plan</p>
            <p className="mt-2 text-sm leading-6 text-white">{result.summary}</p>
          </div>

          {result.recommendedTasks.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-white">Recommended order</p>
              {result.recommendedTasks.map((task) => (
                <div key={task.taskId} className={ui.panelNested}>
                  <div className="flex items-start gap-3">
                    <span className={ui.rankBadge}>{task.rank}</span>
                    <div>
                      <p className="font-medium text-white">{task.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{task.reason}</p>
                      <p className="mt-2 text-sm text-cyan-100">{task.suggestedAction}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

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
