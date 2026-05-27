export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const controlBase =
  "rounded-xl border border-white/5 bg-white/5 text-sm text-white outline-none focus:border-cyan-400 focus:bg-white/10 transition-all duration-200 backdrop-blur-md shadow-inner";

export const ui = {
  appShell: "min-h-screen bg-[#06080F] text-slate-100 selection:bg-cyan-500/30",
  appContainer:
    "mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 relative z-10",
  panel: "rounded-2xl border border-white/10 bg-white/[0.02] p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/5 before:to-transparent before:pointer-events-none",
  panelCompact: "rounded-xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-lg shadow-xl",
  panelNested: "rounded-xl border border-white/5 bg-black/20 p-5 backdrop-blur-md",
  taskCard:
    "group rounded-2xl border border-white/5 bg-white/[0.02] p-5 shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/50 hover:bg-white/[0.04] hover:shadow-cyan-500/10 cursor-pointer relative overflow-hidden",
  skeleton: "h-48 animate-pulse rounded-2xl border border-white/5 bg-white/[0.02]",
  emptyState:
    "rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.01] p-12 text-center backdrop-blur-sm transition-colors hover:border-white/20 hover:bg-white/[0.02]",
  overline: "text-xs font-bold uppercase tracking-[0.25em] text-cyan-400",
  metaLabel: "text-xs font-semibold uppercase tracking-widest text-slate-400",
  fieldLabel: "block text-sm font-medium text-slate-200",
  fieldLabelStacked: "flex flex-col gap-1.5 text-sm text-slate-200",
  fieldLabelSpaced: "flex flex-col gap-2 text-sm text-slate-200",
  input: cx(
    "mt-2 w-full px-4 py-3 placeholder:text-slate-500",
    controlBase
  ),
  textarea: cx(
    "mt-2 w-full resize-none px-4 py-3 leading-relaxed placeholder:text-slate-500",
    controlBase
  ),
  select: cx(
    "mt-2 w-full px-4 py-3 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7%2010L12%2015L17%2010%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[position:right_0.75rem_center] bg-no-repeat pr-10",
    controlBase
  ),
  selectCompact: cx(
    "px-3 py-2 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7%2010L12%2015L17%2010%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[position:right_0.5rem_center] bg-no-repeat pr-9",
    controlBase
  ),
  selectFilter:
    "rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white outline-none transition-all hover:bg-white/10 focus:ring-2 focus:ring-cyan-400/50 backdrop-blur-md appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7%2010L12%2015L17%2010%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[position:right_0.5rem_center] bg-no-repeat pr-9",
  primaryButton:
    "w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-cyan-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100",
  accentButton:
    "rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300 transition-all duration-200 hover:bg-cyan-400/20 hover:border-cyan-400/50 active:scale-95",
  accentButtonFull:
    "w-full rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-300 transition-all duration-200 hover:bg-cyan-400/20 hover:border-cyan-400/50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
  secondaryButton:
    "rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 backdrop-blur-md transition-all duration-200 hover:bg-white/10 hover:text-white active:scale-95",
  dangerButton:
    "rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition-all duration-200 hover:bg-red-500/20 hover:border-red-500/50 active:scale-95",
  linkButton:
    "mt-2 text-sm font-medium text-slate-400 underline-offset-4 transition-colors hover:text-cyan-400 hover:underline",
  mobilePrimaryNav:
    "rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-center text-sm font-bold text-cyan-300 backdrop-blur-md transition-colors hover:bg-cyan-400/20",
  mobileSecondaryNav:
    "rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-bold text-slate-200 backdrop-blur-md transition-colors hover:bg-white/10",
  badge: "rounded-md border border-white/10 bg-white/10 px-2.5 py-1 text-xs font-semibold backdrop-blur-md",
  alertError:
    "rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-medium text-red-200 backdrop-blur-md shadow-lg shadow-red-500/5",
  alertSuccess: "rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm font-medium text-emerald-200 backdrop-blur-md shadow-lg shadow-emerald-500/5",
  alertWarning: "rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm font-medium text-amber-200 backdrop-blur-md shadow-lg shadow-amber-500/5",
  aiPanel: "rounded-2xl border border-purple-500/30 bg-purple-500/10 p-6 backdrop-blur-xl shadow-2xl shadow-purple-500/10 relative overflow-hidden before:absolute before:-inset-2 before:bg-gradient-to-br before:from-purple-500/20 before:to-cyan-500/20 before:blur-2xl before:-z-10",
  rankBadge:
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/30",
} as const;
