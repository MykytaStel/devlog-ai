"use client";

import { useEffect, useMemo, useState } from "react";

import type {
  TaskDto,
  TaskPriority,
  TaskStatus,
} from "@/features/tasks/task.types";
import type { TaskMutationInput } from "@/features/tasks/task.api";

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

export function TaskForm({
  editingTask,
  isSubmitting,
  onSubmit,
  onCancelEdit,
}: TaskFormProps) {
  const [form, setForm] = useState<TaskMutationInput>(emptyForm);

  const isEditing = Boolean(editingTask);

  const canSubmit = useMemo(() => {
    return form.title.trim().length > 0 && form.description.trim().length > 0;
  }, [form.description, form.title]);

  useEffect(() => {
    if (!editingTask) {
      setForm(emptyForm);
      return;
    }

    setForm({
      title: editingTask.title,
      description: editingTask.description,
      status: editingTask.status,
      priority: editingTask.priority,
      parentId: editingTask.parentId,
    });
  }, [editingTask]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit || isSubmitting) {
      return;
    }

    await onSubmit({
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
    });

    if (!isEditing) {
      setForm(emptyForm);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20"
    >
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
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10"
          >
            Cancel
          </button>
        ) : null}
      </div>

      <div className="mt-5 space-y-4">
        <label className="block text-sm font-medium text-slate-300">
          Title
          <input
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                title: event.target.value,
              }))
            }
            placeholder="Example: Build task CRUD API"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-300"
          />
        </label>

        <label className="block text-sm font-medium text-slate-300">
          Description
          <textarea
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            placeholder="Describe the task, expected outcome, constraints, and context."
            rows={6}
            className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-cyan-300"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-300">
            Status
            <select
              value={form.status}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  status: event.target.value as TaskStatus,
                }))
              }
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
            >
              <option value="todo">Todo</option>
              <option value="in-progress">In progress</option>
              <option value="done">Done</option>
            </select>
          </label>

          <label className="block text-sm font-medium text-slate-300">
            Priority
            <select
              value={form.priority}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  priority: event.target.value as TaskPriority,
                }))
              }
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
        </div>

        <button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className="w-full rounded-2xl bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? "Saving..."
            : isEditing
              ? "Save changes"
              : "Create task"}
        </button>
      </div>
    </form>
  );
}
