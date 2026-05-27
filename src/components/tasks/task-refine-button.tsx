"use client";

import { useState } from "react";
import { cx } from "@/components/ui/styles";
import { runRefineAgent } from "@/features/ai/ai.api";
import type { RefineTaskResult } from "@/features/ai/refine.types";

type TaskRefineButtonProps = {
  title: string;
  description: string;
  onRefined: (result: RefineTaskResult) => void;
};

export function TaskRefineButton({ title, description, onRefined }: TaskRefineButtonProps) {
  const [isRefining, setIsRefining] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);

  async function handleRefine() {
    setIsRefining(true);
    setRefineError(null);
    try {
      const result = await runRefineAgent(title, description);
      onRefined(result);
    } catch (error) {
      setRefineError(error instanceof Error ? error.message : "Failed to refine task");
    } finally {
      setIsRefining(false);
    }
  }

  return (
    <>
      {refineError ? (
        <p className="mt-1 text-xs text-red-400">{refineError}</p>
      ) : null}
      <button
        type="button"
        onClick={handleRefine}
        disabled={isRefining || title.trim().length === 0}
        className={cx(
          "text-xs font-semibold text-purple-400 hover:text-purple-300",
          "transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        {isRefining ? "✨ Refining..." : "✨ Auto-Refine with AI"}
      </button>
    </>
  );
}
