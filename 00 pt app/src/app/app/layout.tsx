import { requireUser } from "@/lib/auth";

function roleLabel(role: string) {
  if (role === "TRAINER") return "Edzo";
  if (role === "CLIENT") return "Kliens";
  return "Admin";
}

export default async function AppLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await requireUser();

  return (
    <main>
      <div className="shell stack">
        <header className="topbar">
          <div>
            <strong>PT App</strong>
            <div className="muted">Szerepkor: {roleLabel(session.role)}</div>
          </div>
        </header>
        {children}
      </div>
    </main>
  );
}
