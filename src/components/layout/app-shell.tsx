import type { ReactNode } from "react";

import { cx, ui } from "@/components/ui/styles";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <main className={ui.appShell}>
      <div className={ui.appContainer}>
        <header className={ui.panel}>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-cyan-300">
                DevLog
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Engineering task tracker
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Track tasks, choose the next focused work block, and break clear
                engineering tasks into executable subtasks.
              </p>
            </div>

            <div
              className={cx(
                ui.panelCompact,
                "grid gap-3 text-sm text-slate-300 sm:grid-cols-3 lg:min-w-[420px]"
              )}
            >
              <div>
                <p className={ui.metaLabel}>Scope</p>
                <p className="mt-1 font-medium text-white">Local MVP</p>
              </div>
              <div>
                <p className={ui.metaLabel}>Storage</p>
                <p className="mt-1 font-medium text-white">SQLite</p>
              </div>
              <div>
                <p className={ui.metaLabel}>AI</p>
                <p className="mt-1 font-medium text-white">2 agents</p>
              </div>
            </div>
          </div>
        </header>

        {children}
      </div>
    </main>
  );
}
