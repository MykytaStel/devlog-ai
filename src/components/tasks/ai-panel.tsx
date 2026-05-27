"use client";

import { useState } from "react";
import { ui } from "@/components/ui/styles";
import type { TaskDto } from "@/features/tasks/task.types";
import { DecompositionPanel } from "./panels/decomposition-panel";
import { PrioritizationPanel } from "./panels/prioritization-panel";
import { RefinePanel } from "./panels/refine-panel";
import { StatusPanel } from "./panels/status-panel";

type AiPanelProps = {
  selectedTask: TaskDto | null;
  onClearSelectedTask: () => void;
  onSubtasksCreated: () => Promise<void>;
};

export function AiPanel({
  selectedTask,
  onClearSelectedTask,
  onSubtasksCreated,
}: AiPanelProps) {
  const [, forceReset] = useState(0);

  function handleClearSelection() {
    forceReset((n) => n + 1);
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

      {/* Global agents — no selected task needed */}
      <div className="mt-5 space-y-3">
        <PrioritizationPanel />
        <StatusPanel />
      </div>

      {/* Selected task context */}
      <div className={`mt-4 ${ui.panelNested}`}>
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
            Click &quot;Break down&quot; on any task card.
          </p>
        )}

        {/* Per-task agents */}
        <div className="mt-4 space-y-2">
          <DecompositionPanel
            selectedTask={selectedTask}
            onSubtasksCreated={onSubtasksCreated}
          />
          <RefinePanel selectedTask={selectedTask} />
        </div>
      </div>
    </section>
  );
}
