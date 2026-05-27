export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const controlBase =
  "rounded-lg border border-white/10 bg-slate-950 text-sm text-white outline-none focus:border-cyan-300";

export const ui = {
  appShell: "min-h-screen bg-slate-950 text-slate-100",
  appContainer:
    "mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 lg:px-8",
  panel: "rounded-lg border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/20",
  panelCompact: "rounded-lg border border-white/10 bg-slate-900/80 p-4",
  panelNested: "rounded-lg border border-white/10 bg-slate-950/70 p-4",
  taskCard:
    "rounded-lg border border-white/10 bg-white/[0.04] p-5 shadow-lg shadow-black/15 transition hover:border-cyan-300/40",
  skeleton: "h-48 animate-pulse rounded-lg border border-white/10 bg-white/[0.04]",
  emptyState:
    "rounded-lg border border-dashed border-white/15 bg-white/[0.03] p-10 text-center",
  overline: "text-sm font-medium uppercase tracking-[0.22em] text-cyan-200",
  metaLabel: "text-xs uppercase tracking-widest text-slate-500",
  fieldLabel: "block text-sm font-medium text-slate-300",
  fieldLabelStacked: "flex flex-col gap-1 text-sm text-slate-300",
  fieldLabelSpaced: "flex flex-col gap-2 text-sm text-slate-300",
  input: cx(
    "mt-2 w-full px-4 py-3 placeholder:text-slate-600",
    controlBase
  ),
  textarea: cx(
    "mt-2 w-full resize-none px-4 py-3 leading-6 placeholder:text-slate-600",
    controlBase
  ),
  select: cx("mt-2 w-full px-4 py-3", controlBase),
  selectCompact: cx("px-3 py-2", controlBase),
  selectFilter:
    "rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-cyan-400/30 transition focus:ring-4",
  primaryButton:
    "w-full rounded-lg bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50",
  accentButton:
    "rounded-lg border border-cyan-300/20 px-3 py-2 text-sm text-cyan-100 transition hover:bg-cyan-300/10",
  accentButtonFull:
    "w-full rounded-lg border border-cyan-300/20 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-50",
  secondaryButton:
    "rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10",
  dangerButton:
    "rounded-lg border border-red-400/20 px-3 py-2 text-sm text-red-200 transition hover:bg-red-500/10",
  linkButton:
    "mt-2 text-xs text-slate-400 underline-offset-4 hover:text-white hover:underline",
  mobilePrimaryNav:
    "rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-center text-sm font-semibold text-cyan-100",
  mobileSecondaryNav:
    "rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-sm font-semibold text-slate-200",
  badge: "rounded-md border border-white/10 bg-slate-950 px-2.5 py-1 text-xs font-medium",
  alertError:
    "rounded-lg border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-100",
  alertSuccess: "rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-4",
  alertWarning: "rounded-lg border border-amber-300/20 bg-amber-300/10 p-4",
  aiPanel: "rounded-lg border border-cyan-300/20 bg-cyan-300/[0.06] p-5",
  rankBadge:
    "flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-cyan-300 text-sm font-bold text-slate-950",
} as const;
