import Link from "next/link";
import { cn } from "@/lib/utils";

export type SidebarLink = {
  href: string;
  label: string;
};

type SidebarProps = {
  title: string;
  subtitle?: string;
  links: SidebarLink[];
  className?: string;
};

export function Sidebar({ title, subtitle, links, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full w-full flex-col gap-6 border-r border-border bg-card/70 px-6 py-8",
        className
      )}
    >
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-muted">EdzőSaaS</p>
        <h2 className="text-2xl font-display">{title}</h2>
        {subtitle ? <p className="text-sm text-muted">{subtitle}</p> : null}
      </div>
      <nav className="flex flex-col gap-2 text-sm font-medium">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-xl px-3 py-2 transition hover:bg-background"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto text-xs text-muted">© 2024 EdzőSaaS</div>
    </aside>
  );
}
