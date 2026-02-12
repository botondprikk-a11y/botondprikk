import { requireUser } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireUser();

  return <div className="min-h-screen bg-background">{children}</div>;
}
