import Link from "next/link";
import { requireTrainer } from "@/lib/auth";
import { db } from "@/lib/db";
import ClientGoalsForm from "../ClientGoalsForm";
import ClientStatusForm from "../ClientStatusForm";
import TrainerSharedNotesForm from "../TrainerSharedNotesForm";

type ClientDetailsPageProps = {
  params: { id: string };
};

export default async function ClientDetailsPage({
  params
}: ClientDetailsPageProps) {
  const { trainer } = await requireTrainer();

  const client = await db.client.findFirst({
    where: {
      id: params.id,
      trainerId: trainer.id,
      type: "ONLINE"
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      status: true,
      sharedNotes: true,
      kcalGoal: true,
      proteinG: true,
      carbsG: true,
      fatG: true
    }
  });

  if (!client) {
    return (
      <section className="panel">
        <h2>Kliens nem talalhato</h2>
        <p className="muted">
          Lehet, hogy nincs hozzaferesed ehhez a klienshez.
        </p>
        <Link href="/app/trainer/clients">Vissza a listahoz</Link>
      </section>
    );
  }

  return (
    <section className="stack">
      <div className="panel">
        <h2>{client.fullName}</h2>
        <p className="muted">Online kliens</p>
        {client.email ? (
          <div className="muted">Email: {client.email}</div>
        ) : null}
      </div>

      <div className="grid">
        <div className="panel">
          <h3>Hozzaferes</h3>
          <ClientStatusForm clientId={client.id} status={client.status} />
        </div>
        <div className="panel">
          <h3>Celok</h3>
          <ClientGoalsForm
            clientId={client.id}
            initialGoals={{
              kcalGoal: client.kcalGoal,
              proteinG: client.proteinG,
              carbsG: client.carbsG,
              fatG: client.fatG
            }}
          />
        </div>
      </div>

      <div className="panel">
        <h3>Kozos jegyzet</h3>
        <TrainerSharedNotesForm
          clientId={client.id}
          initialNotes={client.sharedNotes ?? null}
        />
      </div>
    </section>
  );
}
