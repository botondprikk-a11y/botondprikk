import InviteForm from "./InviteForm";
import { requireTrainer } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function TrainerDashboardPage() {
  const { trainer } = await requireTrainer();

  const onlineClients = await db.client.count({
    where: {
      trainerId: trainer.id,
      type: "ONLINE"
    }
  });

  return (
    <section className="stack">
      <div className="grid">
        <div className="panel">
          <h2>Attekintes</h2>
          <p className="muted">Online kliensek szama: {onlineClients}</p>
          {onlineClients === 0 ? (
            <div className="empty">Meg nincs online kliensed.</div>
          ) : null}
        </div>
        <div className="panel">
          <h2>Meghivo kuldese</h2>
          <p className="muted">
            Add meg a kliens email cimet, majd kuldd el neki a linket.
          </p>
          <InviteForm />
        </div>
      </div>
    </section>
  );
}
