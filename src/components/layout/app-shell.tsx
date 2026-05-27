import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <header className="rounded-lg border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/20">
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

            <div className="grid gap-3 rounded-lg border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-300 sm:grid-cols-3 lg:min-w-[420px]">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500">
                  Scope
                </p>
                <p className="mt-1 font-medium text-white">Local MVP</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500">
                  Storage
                </p>
                <p className="mt-1 font-medium text-white">SQLite</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500">
                  AI
                </p>
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
