"use client";

import { useState } from "react";
import { cx, ui } from "@/components/ui/styles";
import {
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  TASK_STATUS_OPTIONS,
  type TaskDto,
  type TaskStatus,
} from "@/features/tasks/task.types";

type TaskCardProps = {
  task: TaskDto;
  onEdit: (task: TaskDto) => void;
  onDelete: (task: TaskDto) => Promise<void>;
  onStatusChange: (task: TaskDto, status: TaskStatus) => Promise<void>;
  onDecompose: (task: TaskDto) => void;
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
  onDecompose,
}: TaskCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleDeleteClick() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setIsDeleting(true);
    try {
      await onDelete(task);
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  }

  async function handleStatusChange(status: TaskStatus) {
    setIsChangingStatus(true);
    try {
      await onStatusChange(task, status);
    } finally {
      setIsChangingStatus(false);
    }
  }

  return (
    <article className={ui.taskCard}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cx(ui.badge, "text-slate-300")}>
              {TASK_STATUS_LABELS[task.status]}
            </span>
            <span className={cx(ui.badge, "text-cyan-200")}>
              {TASK_PRIORITY_LABELS[task.priority]} priority
            </span>
            {task.parentId ? (
              <span className={cx(ui.badge, "text-violet-200")}>
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

        <div className="flex shrink-0 flex-row flex-wrap gap-2 sm:flex-col">
          <button
            type="button"
            onClick={() => onDecompose(task)}
            className={ui.accentButton}
          >
            Break down
          </button>
          <button
            type="button"
            onClick={() => onEdit(task)}
            className={ui.secondaryButton}
          >
            Edit
          </button>

          {confirmDelete ? (
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className={cx(
                  ui.dangerButton,
                  "font-bold disabled:opacity-50"
                )}
              >
                {isDeleting ? "Deleting…" : "Confirm"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className={ui.secondaryButton}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleDeleteClick}
              className={ui.dangerButton}
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 border-t border-white/10 pt-4">
        <label className={cx(ui.fieldLabelSpaced, "sm:max-w-xs")}>
          Quick status update
          <select
            value={task.status}
            disabled={isChangingStatus}
            onChange={(event) =>
              handleStatusChange(event.target.value as TaskStatus)
            }
            className={cx(
              ui.selectCompact,
              isChangingStatus && "opacity-50 cursor-wait"
            )}
          >
            {TASK_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </article>
  );
}
