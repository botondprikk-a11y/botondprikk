import Link from "next/link";
import { requireCoach } from "@/lib/auth";
import { db } from "@/lib/db";
import { getWeekKey } from "@/lib/date";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/button";

export default async function CoachDashboardPage() {
  const coach = await requireCoach();
  const clients = await db.coachClient.findMany({
    where: { coachId: coach.id, status: "ACTIVE" },
    include: { client: true }
  });

  const clientIds = clients.map((c) => c.clientId);
  const since = new Date();
  since.setDate(since.getDate() - 3);

  const recentSessions = await db.workoutSession.findMany({
    where: { clientId: { in: clientIds }, completedAt: { gte: since } },
    select: { clientId: true },
    distinct: ["clientId"]
  });

  const recentClientIds = new Set(recentSessions.map((s) => s.clientId));
  const missingWorkouts = clients.filter((c) => !recentClientIds.has(c.clientId));

  const weekKey = getWeekKey();
  const checkins = await db.checkIn.findMany({
    where: { clientId: { in: clientIds }, weekKey },
    select: { clientId: true }
  });
  const checkinSet = new Set(checkins.map((c) => c.clientId));
  const missingCheckins = clients.filter((c) => !checkinSet.has(c.clientId));

  const now = new Date();
  const soon = new Date();
  soon.setDate(soon.getDate() + 7);
  const expiringPackages = await db.offlinePackage.findMany({
    where: {
      coachId: coach.id,
      OR: [
        { sessionsLeft: { lte: 0 } },
        { expiryDate: { lte: soon } }
      ]
    }
  });

  const notification = await db.notificationPreference.findUnique({ where: { userId: coach.id } });

  async function saveNotifications(formData: FormData) {
    "use server";
    const emailNewCheckin = formData.get("emailNewCheckin") === "on";
    const emailNewMessage = formData.get("emailNewMessage") === "on";

    await db.notificationPreference.upsert({
      where: { userId: coach.id },
      update: { emailNewCheckin, emailNewMessage },
      create: { userId: coach.id, emailNewCheckin, emailNewMessage }
    });
  }

  return (
    <div className="space-y-8">
      <Topbar title="Dashboard" />

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <h3 className="text-sm uppercase tracking-[0.2em] text-muted">Nem logolt 3 napja</h3>
          <p className="mt-3 text-3xl font-semibold">{missingWorkouts.length}</p>
        </Card>
        <Card>
          <h3 className="text-sm uppercase tracking-[0.2em] text-muted">Hiányzó check-in</h3>
          <p className="mt-3 text-3xl font-semibold">{missingCheckins.length}</p>
        </Card>
        <Card>
          <h3 className="text-sm uppercase tracking-[0.2em] text-muted">Lejáró bérlet</h3>
          <p className="mt-3 text-3xl font-semibold">{expiringPackages.length}</p>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold">Figyelem</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {missingWorkouts.slice(0, 3).map((c) => (
              <li key={c.id} className="flex items-center justify-between">
                <span>{c.client.name}</span>
                <Badge variant="warning">Edzés hiány</Badge>
              </li>
            ))}
            {missingCheckins.slice(0, 3).map((c) => (
              <li key={c.id} className="flex items-center justify-between">
                <span>{c.client.name}</span>
                <Badge variant="warning">Check-in hiány</Badge>
              </li>
            ))}
            {expiringPackages.slice(0, 3).map((pkg) => (
              <li key={pkg.id} className="flex items-center justify-between">
                <span>{pkg.clientName}</span>
                <Badge variant="danger">Bérlet kritikus</Badge>
              </li>
            ))}
            {!missingWorkouts.length && !missingCheckins.length && !expiringPackages.length ? (
              <li className="text-muted">Nincs kiemelt figyelmeztetés.</li>
            ) : null}
          </ul>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold">Gyors műveletek</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm">
            <Link href="/app/coach/clients" className="rounded-xl border border-border px-4 py-3">
              Vendég meghívása
            </Link>
            <Link href="/app/coach/programs" className="rounded-xl border border-border px-4 py-3">
              Program létrehozása
            </Link>
            <Link href="/app/coach/reports/monthly" className="rounded-xl border border-border px-4 py-3">
              Havi riport megnyitása
            </Link>
          </div>
        </Card>
      </section>

      <Card>
        <h3 className="text-lg font-semibold">Értesítések</h3>
        <form action={saveNotifications} className="mt-4 grid gap-3 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="emailNewCheckin" defaultChecked={notification?.emailNewCheckin ?? true} />
            Email új check-in esetén
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="emailNewMessage" defaultChecked={notification?.emailNewMessage ?? true} />
            Email új üzenet esetén
          </label>
          <Button type="submit" variant="outline">Mentés</Button>
        </form>
      </Card>
    </div>
  );
}
