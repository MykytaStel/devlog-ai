export const TASK_STATUSES = ["todo", "in-progress", "done"] as const;
export const TASK_PRIORITIES = ["low", "medium", "high"] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export type TaskSort = "createdAt" | "priority";

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "Todo",
  "in-progress": "In progress",
  done: "Done",
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const TASK_STATUS_OPTIONS = TASK_STATUSES.map((value) => ({
  value,
  label: TASK_STATUS_LABELS[value],
}));

export const TASK_FILTER_STATUS_OPTIONS = [
  {
    value: "all",
    label: "All",
  },
  ...TASK_STATUS_OPTIONS,
] as const;

export const TASK_PRIORITY_OPTIONS = TASK_PRIORITIES.map((value) => ({
  value,
  label: TASK_PRIORITY_LABELS[value],
}));

export const TASK_SORT_OPTIONS = [
  {
    value: "createdAt",
    label: "Newest first",
  },
  {
    value: "priority",
    label: "Priority",
  },
] as const satisfies ReadonlyArray<{
  value: TaskSort;
  label: string;
}>;

export type TaskDto = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TaskWithSubtasksDto = TaskDto & {
  subtasks: TaskDto[];
};

export function isTaskStatus(value: string): value is TaskStatus {
  return TASK_STATUSES.includes(value as TaskStatus);
}

export function isTaskPriority(value: string): value is TaskPriority {
  return TASK_PRIORITIES.includes(value as TaskPriority);
}
