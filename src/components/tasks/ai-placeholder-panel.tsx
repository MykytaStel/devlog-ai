"use client";

import { useState } from "react";

import { runPrioritization } from "@/features/ai/ai.api";
import type { PrioritizationResult } from "@/features/ai/prioritization.types";

export function AiPlaceholderPanel() {
  const [result, setResult] = useState<PrioritizationResult | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handlePlanDay() {
    setIsPlanning(true);
    setErrorMessage(null);

    try {
      const nextResult = await runPrioritization();
      setResult(nextResult);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to run AI planning"
      );
    } finally {
      setIsPlanning(false);
    }
  }

  return (
    <section className="rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.06] p-5">
      <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-200">
        AI Agent Layer
      </p>

      <h2 className="mt-3 text-xl font-semibold text-white">
        Plan the next focused work block
      </h2>

      <p className="mt-3 text-sm leading-6 text-slate-300">
        The prioritization agent loads the current task context, scores tasks by
        status, priority, age, and clarity, then turns that into a practical day
        plan.
      </p>

      <button
        type="button"
        onClick={handlePlanDay}
        disabled={isPlanning}
        className="mt-5 w-full rounded-2xl bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPlanning ? "Planning..." : "Plan my day"}
      </button>

      {errorMessage ? (
        <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-100">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <div className="mt-5 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
            <p className="text-xs uppercase tracking-widest text-slate-500">
              Recommendation
            </p>
            <p className="mt-2 text-sm leading-6 text-white">
              {result.summary}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3">
              <p className="text-slate-500">Actionable</p>
              <p className="mt-1 text-xl font-semibold text-white">
                {result.contextStats.actionableTasks}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3">
              <p className="text-slate-500">High priority</p>
              <p className="mt-1 text-xl font-semibold text-white">
                {result.contextStats.highPriorityTasks}
              </p>
            </div>
          </div>

          {result.recommendedTasks.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-white">Recommended order</p>
              {result.recommendedTasks.map((task) => (
                <div
                  key={task.taskId}
                  className="rounded-2xl border border-white/10 bg-slate-950/70 p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-300 text-sm font-bold text-slate-950">
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

          {result.reasoning.length > 0 ? (
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
              <p className="text-sm font-medium text-white">Reasoning</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-300">
                {result.reasoning.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {result.risks.length > 0 ? (
            <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
              <p className="text-sm font-medium text-amber-100">Risks</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-amber-50/90">
                {result.risks.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <details className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
            <summary className="cursor-pointer text-sm font-medium text-slate-300">
              Agent steps
            </summary>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-400">
              {result.agentSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </details>
        </div>
      ) : (
        <div className="mt-5 grid gap-3">
          <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
            <p className="font-medium text-white">Prioritization Agent</p>
            <p className="mt-1 text-sm text-slate-400">
              Implemented in this slice.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
            <p className="font-medium text-white">Decomposition Agent</p>
            <p className="mt-1 text-sm text-slate-400">
              Next slice: generate subtasks or ask a clarification question.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
