"use client";

import { useState } from "react";
import { cx, ui } from "@/components/ui/styles";
import { runStatusUpdate } from "@/features/ai/ai.api";
import type { StatusUpdateResult } from "@/features/ai/status.types";

export function StatusPanel() {
  const [result, setResult] = useState<StatusUpdateResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerateStatus() {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await runStatusUpdate());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate status update");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleGenerateStatus}
        disabled={isLoading}
        className={ui.secondaryButton}
      >
        {isLoading ? "Generating…" : "Generate Standup Update"}
      </button>

      {error ? <div className={cx(ui.alertError)}>{error}</div> : null}

      {result ? (
        <div className="space-y-3">
          <div className={ui.panelNested}>
            <p className={ui.metaLabel}>Standup Update</p>
            <div className="mt-2 whitespace-pre-wrap rounded bg-black/20 border border-white/5 p-4 text-sm leading-6 text-white">
              {result.updateText}
            </div>
            <button
              type="button"
              className={cx("mt-3", ui.accentButton)}
              onClick={() => navigator.clipboard.writeText(result.updateText)}
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
