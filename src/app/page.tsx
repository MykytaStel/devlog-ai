import { AppShell } from "@/components/layout/app-shell";
import { TaskWorkspace } from "@/components/tasks/task-workspace";

export default function Home() {
  return (
    <AppShell>
      <TaskWorkspace />
    </AppShell>
  );
}
