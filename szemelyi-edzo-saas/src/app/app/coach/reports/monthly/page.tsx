import { requireCoach } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Topbar } from "@/components/layout/Topbar";

function getMonthRange(month: string | undefined) {
  const now = new Date();
  const [year, monthStr] = (month ?? "").split("-");
  const y = Number(year) || now.getFullYear();
  const m = Number(monthStr) ? Number(monthStr) - 1 : now.getMonth();
  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 1);
  return { start, end, label: `${y}-${String(m + 1).padStart(2, "0")}` };
}

export default async function MonthlyReportPage({ searchParams }: { searchParams: { month?: string } }) {
  const coach = await requireCoach();
  const { start, end, label } = getMonthRange(searchParams.month);

  const sessions = await db.offlineSession.findMany({
    where: {
      package: { coachId: coach.id },
      date: { gte: start, lt: end }
    },
    include: { package: true }
  });

  const payments = await db.offlinePayment.findMany({
    where: {
      package: { coachId: coach.id },
      date: { gte: start, lt: end }
    }
  });

  const held = sessions.filter((s) => s.status === "HELD").length;
  const cancelled = sessions.filter((s) => s.status === "CANCELLED").length;
  const noShow = sessions.filter((s) => s.status === "NO_SHOW").length;
  const revenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const avgRevenue = held ? Math.round(revenue / held) : 0;

  const activityMap = new Map<string, number>();
  sessions
    .filter((s) => s.status === "HELD")
    .forEach((s) => {
      const key = s.package.clientName;
      activityMap.set(key, (activityMap.get(key) ?? 0) + 1);
    });

  const topClients = Array.from(activityMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const soon = new Date();
  soon.setDate(soon.getDate() + 7);
  const expiringPackages = await db.offlinePackage.findMany({
    where: {
      coachId: coach.id,
      OR: [{ sessionsLeft: { lte: 0 } }, { expiryDate: { lte: soon } }]
    }
  });

  return (
    <div className="space-y-8">
      <Topbar title="Havi riport" />
      <Card>
        <p className="text-sm text-muted">Hónap</p>
        <p className="text-lg font-semibold">{label}</p>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-sm text-muted">Megtartott edzések</p>
          <p className="text-2xl font-semibold">{held}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Lemondások</p>
          <p className="text-2xl font-semibold">{cancelled}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">No-show</p>
          <p className="text-2xl font-semibold">{noShow}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Bevétel</p>
          <p className="text-2xl font-semibold">{revenue} Ft</p>
          <p className="text-xs text-muted">Átlag: {avgRevenue} Ft/edzés</p>
        </Card>
      </section>

      <Card>
        <h3 className="text-lg font-semibold">Top vendégek aktivitás alapján</h3>
        <div className="mt-4">
          <Table>
            <THead>
              <TR>
                <TH>Vendég</TH>
                <TH>Edzések</TH>
              </TR>
            </THead>
            <TBody>
              {topClients.map(([name, count]) => (
                <TR key={name}>
                  <TD>{name}</TD>
                  <TD>{count}</TD>
                </TR>
              ))}
              {!topClients.length ? (
                <TR>
                  <TD colSpan={2} className="text-muted">Nincs adat.</TD>
                </TR>
              ) : null}
            </TBody>
          </Table>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">Figyelmeztetések</h3>
        <ul className="mt-4 space-y-2 text-sm text-muted">
          {expiringPackages.map((pkg) => (
            <li key={pkg.id}>
              {pkg.clientName} · {pkg.sessionsLeft} alkalom ·
              {pkg.expiryDate ? ` lejárat: ${pkg.expiryDate.toLocaleDateString("hu-HU")}` : " nincs lejárat"}
            </li>
          ))}
          {!expiringPackages.length ? <li>Nincs kritikus bérlet.</li> : null}
        </ul>
      </Card>
    </div>
  );
}
