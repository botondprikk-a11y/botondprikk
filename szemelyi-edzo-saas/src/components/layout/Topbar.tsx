import Link from "next/link";

export function Topbar({ title, actionLabel, actionHref }: { title: string; actionLabel?: string; actionHref?: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-muted">App</p>
        <h1 className="text-2xl font-display">{title}</h1>
      </div>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-card"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
