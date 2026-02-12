import { Sidebar } from "@/components/layout/Sidebar";
import { requireClient } from "@/lib/auth";

const links = [
  { href: "/app/client/today", label: "Ma" },
  { href: "/app/client/workouts", label: "Edzések" },
  { href: "/app/client/nutrition", label: "Táplálkozás" },
  { href: "/app/client/progress", label: "Progress" },
  { href: "/app/client/checkin", label: "Check-in" },
  { href: "/app/client/messages", label: "Üzenetek" }
];

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const user = await requireClient();

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
      <Sidebar title={user.name} subtitle="Vendég fiók" links={links} />
      <main className="px-6 py-8 lg:px-10">{children}</main>
    </div>
  );
}
