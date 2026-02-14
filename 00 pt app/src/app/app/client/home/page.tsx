import { requireClient } from "@/lib/auth";
import SharedNotesForm from "./SharedNotesForm";

export default async function ClientHomePage() {
  const { client } = await requireClient();

  const isExpired =
    client.status === "EXPIRED" ||
    (client.accessEndsAt && client.accessEndsAt < new Date());

  if (isExpired) {
    return (
      <section className="panel">
        <h2>Lejart hozzaferes</h2>
        <p className="muted">
          A hozzaferesed lejart. Kerlek vedd fel a kapcsolatot az edzoddel.
        </p>
      </section>
    );
  }

  return (
    <section className="stack">
      <div className="panel">
        <h2>Udv, {client.fullName}</h2>
        <p className="muted">Itt fogod latni a sajat adataidat.</p>
      </div>
      <div className="grid">
        <div className="panel">
          <h3>Edzesterv</h3>
          <div className="empty">Nincs aktiv edzesterved.</div>
        </div>
        <div className="panel">
          <h3>Napi log</h3>
          <div className="empty">Ma meg nincs rogzites.</div>
        </div>
      </div>
      <div className="panel">
        <h3>Kozos jegyzet</h3>
        <p className="muted">
          Ezt a jegyzetet te es az edzod is latjatok.
        </p>
        <SharedNotesForm initialNotes={client.sharedNotes ?? null} />
      </div>
    </section>
  );
}
