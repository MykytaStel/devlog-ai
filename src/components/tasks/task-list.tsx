"use client";

import { ui } from "@/components/ui/styles";
import type { TaskDto, TaskStatus } from "@/features/tasks/task.types";
import { TaskCard } from "./task-card";

type TaskListProps = {
  tasks: TaskDto[];
  isLoading: boolean;
  onEdit: (task: TaskDto) => void;
  onDelete: (task: TaskDto) => Promise<void>;
  onStatusChange: (task: TaskDto, status: TaskStatus) => Promise<void>;
  onDecompose: (task: TaskDto) => void;
};

export function TaskList({
  tasks,
  isLoading,
  onEdit,
  onDelete,
  onStatusChange,
  onDecompose,
}: TaskListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className={ui.skeleton}
          />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className={ui.emptyState}>
        <p className="text-lg font-semibold text-white">No tasks yet</p>
        <p className="mt-2 text-sm text-slate-400">
          Create the first task to start building your DevLog workflow.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          onDecompose={onDecompose}
        />
      ))}
    </div>
  );
}
