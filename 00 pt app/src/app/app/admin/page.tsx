import { requireAdmin } from "@/lib/auth";

export default async function AdminPage() {
  await requireAdmin();

  return (
    <section className="panel">
      <h2>Admin felulet</h2>
      <p className="muted">
        Itt jelenik meg az edzok listaja es a szamlazasi log.
      </p>
      <div className="empty">Nincs megjelenitheto adat.</div>
    </section>
  );
}
