import { Sidebar } from "@/components/layout/Sidebar";
import { requireCoach } from "@/lib/auth";

const links = [
  { href: "/app/coach/dashboard", label: "Dashboard" },
  { href: "/app/coach/clients", label: "Vendégek" },
  { href: "/app/coach/programs", label: "Programok" },
  { href: "/app/coach/offline", label: "Offline PT" },
  { href: "/app/coach/reports/monthly", label: "Havi riport" }
];

export default async function CoachLayout({ children }: { children: React.ReactNode }) {
  const user = await requireCoach();

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
      <Sidebar title={user.name} subtitle="Edzői fiók" links={links} />
      <main className="px-6 py-8 lg:px-10">{children}</main>
    </div>
  );
}
