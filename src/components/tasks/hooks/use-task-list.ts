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

export type UseTaskListReturn = {
  tasks: TaskDto[];
  filters: TaskListFilters;
  isLoading: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;
  setFilters: React.Dispatch<React.SetStateAction<TaskListFilters>>;
  loadTasks: () => Promise<void>;
  handleSubmit: (
    input: TaskMutationInput,
    editingTask: TaskDto | null
  ) => Promise<void>;
  handleDelete: (
    task: TaskDto,
    editingTask: TaskDto | null,
    selectedTaskForAi: TaskDto | null,
    onClearEditing: () => void,
    onClearAi: () => void
  ) => Promise<void>;
  handleStatusChange: (task: TaskDto, status: TaskStatus) => Promise<void>;
};

export function useTaskList(): UseTaskListReturn {
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [filters, setFilters] = useState<TaskListFilters>({
    status: "all",
    sort: "createdAt",
  });
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
      setErrorMessage(error instanceof Error ? error.message : "Failed to load tasks");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    let active = true;

    fetchTasks(filters)
      .then((nextTasks) => {
        if (active) {
          setTasks(nextTasks);
          setErrorMessage(null);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        if (active) {
          setErrorMessage(
            error instanceof Error ? error.message : "Failed to load tasks"
          );
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [filters]);

  async function handleSubmit(
    input: TaskMutationInput,
    editingTask: TaskDto | null
  ) {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      if (editingTask) {
        await updateTask(editingTask.id, input);
      } else {
        await createTask(input);
      }
      await loadTasks();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to save task");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(
    task: TaskDto,
    editingTask: TaskDto | null,
    selectedTaskForAi: TaskDto | null,
    onClearEditing: () => void,
    onClearAi: () => void
  ) {
    setErrorMessage(null);
    try {
      await deleteTask(task.id);
      if (editingTask?.id === task.id) onClearEditing();
      if (selectedTaskForAi?.id === task.id) onClearAi();
      await loadTasks();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to delete task");
    }
  }

  async function handleStatusChange(task: TaskDto, status: TaskStatus) {
    setErrorMessage(null);
    try {
      await updateTask(task.id, { status });
      await loadTasks();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to update task");
    }
  }

  return {
    tasks,
    filters,
    isLoading,
    isSubmitting,
    errorMessage,
    setFilters,
    loadTasks,
    handleSubmit,
    handleDelete,
    handleStatusChange,
  };
}
