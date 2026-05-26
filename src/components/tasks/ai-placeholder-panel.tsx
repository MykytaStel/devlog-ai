export function AiPlaceholderPanel() {
  return (
    <section className="rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.06] p-5">
      <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-200">
        AI Agent Layer
      </p>
      <h2 className="mt-3 text-xl font-semibold text-white">
        Next slice: planning and decomposition
      </h2>
      <p className="mt-3 text-sm leading-6 text-slate-300">
        This panel is reserved for the assignment&apos;s agent features:
        day planning based on task context and task decomposition with
        clarification when the task is vague.
      </p>

      <div className="mt-5 grid gap-3">
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
          <p className="font-medium text-white">Prioritization Agent</p>
          <p className="mt-1 text-sm text-slate-400">
            Will analyze priority, status, age, and task context.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
          <p className="font-medium text-white">Decomposition Agent</p>
          <p className="mt-1 text-sm text-slate-400">
            Will generate subtasks or ask for clarification first.
          </p>
        </div>
      </div>
    </section>
  );
}
