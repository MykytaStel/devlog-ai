"use client";

import type { TaskSort, TaskStatus } from "@/features/tasks/task.types";

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
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-lg font-semibold text-white">Tasks</h2>
        <p className="text-sm text-slate-400">
          Filter by status and sort by date or priority.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="flex flex-col gap-1 text-sm text-slate-300">
          Status
          <select
            value={status}
            onChange={(event) =>
              onStatusChange(event.target.value as TaskStatus | "all")
            }
            className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-cyan-400/30 transition focus:ring-4"
          >
            <option value="all">All</option>
            <option value="todo">Todo</option>
            <option value="in-progress">In progress</option>
            <option value="done">Done</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-300">
          Sort
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value as TaskSort)}
            className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-cyan-400/30 transition focus:ring-4"
          >
            <option value="createdAt">Newest first</option>
            <option value="priority">Priority</option>
          </select>
        </label>
      </div>
    </div>
  );
}
