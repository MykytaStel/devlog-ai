"use client";

import { useMemo, useState } from "react";

import { cx, ui } from "@/components/ui/styles";
import type { TaskMutationInput } from "@/features/tasks/task.api";
import {
  TASK_PRIORITY_OPTIONS,
  TASK_STATUS_OPTIONS,
  type TaskDto,
  type TaskPriority,
  type TaskStatus,
} from "@/features/tasks/task.types";
import { TaskRefineButton } from "./task-refine-button";

type TaskFormProps = {
  editingTask: TaskDto | null;
  isSubmitting: boolean;
  onSubmit: (input: TaskMutationInput) => Promise<void>;
  onCancelEdit: () => void;
};

const emptyForm: TaskMutationInput = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
};

function getInitialForm(editingTask: TaskDto | null): TaskMutationInput {
  if (!editingTask) return emptyForm;
  return {
    title: editingTask.title,
    description: editingTask.description,
    status: editingTask.status,
    priority: editingTask.priority,
    parentId: editingTask.parentId,
  };
}

// ─── Public wrapper (preserves key-based reset) ──────────────────────────────

export function TaskForm({
  editingTask,
  isSubmitting,
  onSubmit,
  onCancelEdit,
}: TaskFormProps) {
  return (
    <TaskFormFields
      key={editingTask?.id ?? "create-task"}
      editingTask={editingTask}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      onCancelEdit={onCancelEdit}
    />
  );
}

// ─── Internal form with state ─────────────────────────────────────────────────

function TaskFormFields({
  editingTask,
  isSubmitting,
  onSubmit,
  onCancelEdit,
}: TaskFormProps) {
  const [form, setForm] = useState<TaskMutationInput>(() => getInitialForm(editingTask));
  const isEditing = Boolean(editingTask);

  const canSubmit = useMemo(
    () => form.title.trim().length > 0 && form.description.trim().length > 0,
    [form.title, form.description]
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || isSubmitting) return;
    await onSubmit({ ...form, title: form.title.trim(), description: form.description.trim() });
    if (!isEditing) setForm(emptyForm);
  }

  return (
    <form id="task-form" onSubmit={handleSubmit} className={ui.panel}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">
            {isEditing ? "Edit task" : "Create task"}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Keep the task clear enough for future AI decomposition.
          </p>
        </div>

        {isEditing ? (
          <button type="button" onClick={onCancelEdit} className={ui.secondaryButton}>
            Cancel
          </button>
        ) : null}
      </div>

      <div className="mt-5 space-y-4">
        <label className={ui.fieldLabel}>
          Title
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Example: Build task CRUD API"
            className={ui.input}
          />
        </label>

        <div>
          <div className="flex items-end justify-between">
            <label className={ui.fieldLabel}>Description</label>
            <TaskRefineButton
              title={form.title}
              description={form.description}
              onRefined={(result) =>
                setForm((f) => ({ ...f, title: result.title, description: result.description }))
              }
            />
          </div>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Describe the task, expected outcome, constraints, and context."
            rows={6}
            className={cx("mt-2", ui.textarea)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className={ui.fieldLabel}>
            Status
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as TaskStatus }))}
              className={ui.select}
            >
              {TASK_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>

          <label className={ui.fieldLabel}>
            Priority
            <select
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as TaskPriority }))}
              className={ui.select}
            >
              {TASK_PRIORITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>
        </div>

        <button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className={ui.primaryButton}
        >
          {isSubmitting ? "Saving..." : isEditing ? "Save changes" : "Create task"}
        </button>
      </div>
    </form>
  );
}
