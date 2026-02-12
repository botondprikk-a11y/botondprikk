import { requireClient } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Topbar } from "@/components/layout/Topbar";

export default async function WorkoutsPage() {
  const client = await requireClient();
  const program = await db.clientProgram.findFirst({
    where: { clientId: client.id },
    include: {
      template: {
        include: { days: { include: { exercises: true }, orderBy: { order: "asc" } } }
      }
    }
  });

  const sessions = await db.workoutSession.findMany({
    where: { clientId: client.id },
    orderBy: { date: "desc" },
    take: 10
  });

  return (
    <div className="space-y-8">
      <Topbar title="Edzésterv" />

      <Card>
        <h3 className="text-lg font-semibold">Aktív program</h3>
        {program ? (
          <div className="mt-4 space-y-4">
            {program.template.days.map((day) => (
              <div key={day.id} className="rounded-xl border border-border p-4">
                <p className="font-semibold">{day.dayName}</p>
                <ul className="mt-2 space-y-1 text-sm text-muted">
                  {day.exercises.map((exercise) => (
                    <li key={exercise.id}>{exercise.name}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">Még nincs hozzárendelt program.</p>
        )}
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">Legutóbbi edzések</h3>
        <div className="mt-4">
          <Table>
            <THead>
              <TR>
                <TH>Dátum</TH>
                <TH>Státusz</TH>
              </TR>
            </THead>
            <TBody>
              {sessions.map((session) => (
                <TR key={session.id}>
                  <TD>{session.date.toLocaleDateString("hu-HU")}</TD>
                  <TD>{session.completedAt ? "Kész" : "Folyamatban"}</TD>
                </TR>
              ))}
              {!sessions.length ? (
                <TR>
                  <TD colSpan={2} className="text-muted">Nincs edzés log.</TD>
                </TR>
              ) : null}
            </TBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
