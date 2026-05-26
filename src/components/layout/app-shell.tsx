import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-300">
                DevLog
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                Engineering task tracker with an AI layer
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Track engineering work, keep priorities visible, and prepare
                the product surface for AI-assisted planning and decomposition.
              </p>
            </div>

            <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-300 sm:grid-cols-3 lg:min-w-[420px]">
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
                <p className="mt-1 font-medium text-white">Next slice</p>
              </div>
            </div>
          </div>
        </header>

        {children}
      </div>
    </main>
  );
}
