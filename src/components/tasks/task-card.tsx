"use client";

import type {
  TaskDto,
  TaskPriority,
  TaskStatus,
} from "@/features/tasks/task.types";

type TaskCardProps = {
  task: TaskDto;
  onEdit: (task: TaskDto) => void;
  onDelete: (task: TaskDto) => void;
  onStatusChange: (task: TaskDto, status: TaskStatus) => void;
};

const priorityLabel: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const statusLabel: Record<TaskStatus, string> = {
  todo: "Todo",
  "in-progress": "In progress",
  done: "Done",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskCardProps) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/20 transition hover:border-cyan-300/40">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 bg-slate-950 px-3 py-1 text-xs font-medium text-slate-300">
              {statusLabel[task.status]}
            </span>
            <span className="rounded-full border border-white/10 bg-slate-950 px-3 py-1 text-xs font-medium text-cyan-200">
              {priorityLabel[task.priority]} priority
            </span>
            {task.parentId ? (
              <span className="rounded-full border border-white/10 bg-slate-950 px-3 py-1 text-xs font-medium text-violet-200">
                Subtask
              </span>
            ) : null}
          </div>

          <h3 className="mt-4 text-xl font-semibold text-white">
            {task.title}
          </h3>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-300">
            {task.description}
          </p>

          <p className="mt-4 text-xs text-slate-500">
            Created {formatDate(task.createdAt)}
          </p>
        </div>

        <div className="flex shrink-0 flex-row gap-2 sm:flex-col">
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(task)}
            className="rounded-xl border border-red-400/20 px-3 py-2 text-sm text-red-200 transition hover:bg-red-500/10"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="mt-5 border-t border-white/10 pt-4">
        <label className="flex flex-col gap-2 text-sm text-slate-300 sm:max-w-xs">
          Quick status update
          <select
            value={task.status}
            onChange={(event) =>
              onStatusChange(task, event.target.value as TaskStatus)
            }
            className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300"
          >
            <option value="todo">Todo</option>
            <option value="in-progress">In progress</option>
            <option value="done">Done</option>
          </select>
        </label>
      </div>
    </article>
  );
}
