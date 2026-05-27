"use client";

import { useState } from "react";

import { ui } from "@/components/ui/styles";
import type { TaskDto } from "@/features/tasks/task.types";
import { AiPanel } from "./ai-panel";
import { useTaskList } from "./hooks/use-task-list";
import { TaskFilters } from "./task-filters";
import { TaskForm } from "./task-form";
import { TaskList } from "./task-list";

export function TaskWorkspace() {
  const [editingTask, setEditingTask] = useState<TaskDto | null>(null);
  const [selectedTaskForAi, setSelectedTaskForAi] = useState<TaskDto | null>(null);

  const {
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
  } = useTaskList();

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
      <nav className="grid grid-cols-2 gap-3 lg:hidden">
        <a href="#task-form" className={ui.mobilePrimaryNav}>
          New task
        </a>
        <a href="#ai-panel" className={ui.mobileSecondaryNav}>
          AI panel
        </a>
      </nav>

      <section className="space-y-4">
        <TaskFilters
          status={filters.status}
          sort={filters.sort}
          onStatusChange={(status) => {
            setFilters((current) => ({ ...current, status }));
          }}
          onSortChange={(sort) => {
            setFilters((current) => ({ ...current, sort }));
          }}
        />

        {errorMessage ? (
          <div className={ui.alertError}>{errorMessage}</div>
        ) : null}

        <TaskList
          tasks={tasks}
          isLoading={isLoading}
          onEdit={setEditingTask}
          onDelete={(task) =>
            handleDelete(
              task,
              editingTask,
              selectedTaskForAi,
              () => setEditingTask(null),
              () => setSelectedTaskForAi(null)
            )
          }
          onStatusChange={handleStatusChange}
          onDecompose={setSelectedTaskForAi}
        />
      </section>

      <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:overflow-x-hidden custom-scrollbar lg:pb-6">
        <TaskForm
          editingTask={editingTask}
          isSubmitting={isSubmitting}
          onSubmit={async (input) => {
            await handleSubmit(input, editingTask);
            if (editingTask) setEditingTask(null);
          }}
          onCancelEdit={() => setEditingTask(null)}
        />

        <AiPanel
          key={selectedTaskForAi?.id ?? "no-task-selected"}
          selectedTask={selectedTaskForAi}
          onClearSelectedTask={() => setSelectedTaskForAi(null)}
          onSubtasksCreated={loadTasks}
        />
      </aside>
    </div>
  );
}
