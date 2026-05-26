"use client";

import { useCallback, useEffect, useState } from "react";

import {
  createTask,
  deleteTask,
  fetchTasks,
  updateTask,
  type TaskListFilters,
  type TaskMutationInput,
} from "@/features/tasks/task.api";
import type { TaskDto, TaskStatus } from "@/features/tasks/task.types";
import { AiPlaceholderPanel } from "./ai-placeholder-panel";
import { TaskFilters } from "./task-filters";
import { TaskForm } from "./task-form";
import { TaskList } from "./task-list";

export function TaskWorkspace() {
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [filters, setFilters] = useState<TaskListFilters>({
    status: "all",
    sort: "createdAt",
  });
  const [editingTask, setEditingTask] = useState<TaskDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const nextTasks = await fetchTasks(filters);
      setTasks(nextTasks);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to load tasks"
      );
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  async function handleSubmit(input: TaskMutationInput) {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (editingTask) {
        await updateTask(editingTask.id, input);
        setEditingTask(null);
      } else {
        await createTask(input);
      }

      await loadTasks();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to save task"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(task: TaskDto) {
    const confirmed = window.confirm(`Delete "${task.title}"?`);

    if (!confirmed) {
      return;
    }

    setErrorMessage(null);

    try {
      await deleteTask(task.id);

      if (editingTask?.id === task.id) {
        setEditingTask(null);
      }

      await loadTasks();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to delete task"
      );
    }
  }

  async function handleStatusChange(task: TaskDto, status: TaskStatus) {
    setErrorMessage(null);

    try {
      await updateTask(task.id, { status });
      await loadTasks();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to update task"
      );
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
      <section className="space-y-4">
        <TaskFilters
          status={filters.status}
          sort={filters.sort}
          onStatusChange={(status) =>
            setFilters((current) => ({
              ...current,
              status,
            }))
          }
          onSortChange={(sort) =>
            setFilters((current) => ({
              ...current,
              sort,
            }))
          }
        />

        {errorMessage ? (
          <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-100">
            {errorMessage}
          </div>
        ) : null}

        <TaskList
          tasks={tasks}
          isLoading={isLoading}
          onEdit={setEditingTask}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      </section>

      <aside className="space-y-4">
        <TaskForm
          editingTask={editingTask}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onCancelEdit={() => setEditingTask(null)}
        />

        <AiPlaceholderPanel />
      </aside>
    </div>
  );
}
