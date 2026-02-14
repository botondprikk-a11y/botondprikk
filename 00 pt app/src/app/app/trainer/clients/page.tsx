import Link from "next/link";
import { Prisma } from "@prisma/client";
import { requireTrainer } from "@/lib/auth";
import { db } from "@/lib/db";
import InviteForm from "../dashboard/InviteForm";
import OfflineClientForm from "./OfflineClientForm";

type ClientsPageProps = {
  searchParams?: { filter?: string };
};

const filters = [
  { key: "all", label: "Osszes" },
  { key: "online", label: "Online" },
  { key: "offline", label: "Offline" },
  { key: "expired", label: "Lejart" }
];

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const { trainer } = await requireTrainer();
  const filter = searchParams?.filter ?? "all";
  const now = new Date();

  let where: Prisma.ClientWhereInput = { trainerId: trainer.id };
  if (filter === "online") {
    where = { trainerId: trainer.id, type: "ONLINE" };
  } else if (filter === "offline") {
    where = { trainerId: trainer.id, type: "OFFLINE" };
  } else if (filter === "expired") {
    where = {
      trainerId: trainer.id,
      OR: [{ status: "EXPIRED" }, { accessEndsAt: { lt: now } }]
    };
  }

  const clients = await db.client.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fullName: true,
      type: true,
      status: true,
      email: true,
      accessEndsAt: true
    }
  });

  return (
    <section className="stack">
      <div className="panel stack">
        <h2>Kliensek</h2>
        <div className="grid">
          {filters.map((item) => (
            <Link
              key={item.key}
              href={`/app/trainer/clients?filter=${item.key}`}
              className="ghost"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid">
        <div className="panel">
          <h3>Online kliens meghivo</h3>
          <p className="muted">
            Kuldd el a meghivot emailben, hogy a kliens regisztralni tudjon.
          </p>
          <InviteForm />
        </div>
        <div className="panel">
          <h3>Offline kliens felvetele</h3>
          <p className="muted">
            Offline kliensnek nincs login, csak itt kezelsz rola adatokat.
          </p>
          <OfflineClientForm />
        </div>
      </div>

      <div className="panel stack">
        <h3>Lista</h3>
        {clients.length === 0 ? (
          <div className="empty">Nincs megjelenitheto kliens.</div>
        ) : (
          <div className="stack">
            {clients.map((client) => {
              const isExpired =
                client.status === "EXPIRED" ||
                (client.accessEndsAt && client.accessEndsAt < now);
              const statusLabel = isExpired ? "Lejart" : "Aktiv";
              const typeLabel = client.type === "ONLINE" ? "Online" : "Offline";
              const href =
                client.type === "ONLINE"
                  ? `/app/trainer/clients/${client.id}`
                  : `/app/trainer/offline-clients/${client.id}`;

              return (
                <div key={client.id} className="panel">
                  <div className="stack">
                    <div>
                      <strong>{client.fullName}</strong>
                      <div className="muted">
                        {typeLabel} - {statusLabel}
                      </div>
                      {client.email ? (
                        <div className="muted">{client.email}</div>
                      ) : null}
                    </div>
                    <Link href={href}>Reszletek megnyitasa</Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
