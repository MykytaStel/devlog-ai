"use client";

import { cx, ui } from "@/components/ui/styles";
import {
  TASK_FILTER_STATUS_OPTIONS,
  TASK_SORT_OPTIONS,
  type TaskSort,
  type TaskStatus,
} from "@/features/tasks/task.types";

type TaskFiltersProps = {
  status: TaskStatus | "all";
  sort: TaskSort;
  onStatusChange: (status: TaskStatus | "all") => void;
  onSortChange: (sort: TaskSort) => void;
};

export function TaskFilters({
  status,
  sort,
  onStatusChange,
  onSortChange,
}: TaskFiltersProps) {
  return (
    <div
      className={cx(
        ui.panelCompact,
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      )}
    >
      <div>
        <h2 className="text-lg font-semibold text-white">Tasks</h2>
        <p className="text-sm text-slate-400">
          Filter by status and sort by date or priority.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <label className={ui.fieldLabelStacked}>
          Status
          <select
            value={status}
            onChange={(event) =>
              onStatusChange(event.target.value as TaskStatus | "all")
            }
            className={ui.selectFilter}
          >
            {TASK_FILTER_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className={ui.fieldLabelStacked}>
          Sort
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value as TaskSort)}
            className={ui.selectFilter}
          >
            {TASK_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
