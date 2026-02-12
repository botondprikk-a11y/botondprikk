import { redirect } from "next/navigation";
import { requireClient } from "@/lib/auth";
import { db } from "@/lib/db";
import { nutritionLogSchema } from "@/lib/validators";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Topbar } from "@/components/layout/Topbar";

function ProgressBar({ value, max }: { value: number; max: number }) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="h-2 w-full rounded-full bg-border">
      <div className="h-2 rounded-full bg-primary" style={{ width: `${percent}%` }} />
    </div>
  );
}

export default async function NutritionPage() {
  const client = await requireClient();
  const goal = await db.nutritionGoal.findFirst({ where: { clientId: client.id } });
  const logs = await db.nutritionLog.findMany({
    where: { clientId: client.id },
    orderBy: { date: "desc" },
    take: 7
  });

  async function saveLog(formData: FormData) {
    "use server";
    const parsed = nutritionLogSchema.safeParse({
      date: formData.get("date"),
      kcal: formData.get("kcal"),
      proteinG: formData.get("proteinG"),
      carbsG: formData.get("carbsG"),
      fatG: formData.get("fatG"),
      note: formData.get("note")
    });

    if (!parsed.success) {
      redirect("/app/client/nutrition");
    }

    const date = new Date(parsed.data.date);

    await db.nutritionLog.upsert({
      where: { clientId_date: { clientId: client.id, date } },
      update: {
        kcal: parsed.data.kcal,
        proteinG: parsed.data.proteinG,
        carbsG: parsed.data.carbsG,
        fatG: parsed.data.fatG,
        note: parsed.data.note
      },
      create: {
        clientId: client.id,
        date,
        kcal: parsed.data.kcal,
        proteinG: parsed.data.proteinG,
        carbsG: parsed.data.carbsG,
        fatG: parsed.data.fatG,
        note: parsed.data.note
      }
    });

    redirect("/app/client/nutrition");
  }

  const latest = logs[0];

  return (
    <div className="space-y-8">
      <Topbar title="Táplálkozás" />

      <Card>
        <h3 className="text-lg font-semibold">Napi célok</h3>
        {goal ? (
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-sm text-muted">Kalória</p>
              <p className="text-sm">{latest?.kcal ?? 0} / {goal.kcal}</p>
              <ProgressBar value={latest?.kcal ?? 0} max={goal.kcal} />
            </div>
            <div>
              <p className="text-sm text-muted">Fehérje</p>
              <p className="text-sm">{latest?.proteinG ?? 0}g / {goal.proteinG}g</p>
              <ProgressBar value={latest?.proteinG ?? 0} max={goal.proteinG} />
            </div>
            <div>
              <p className="text-sm text-muted">Szénhidrát</p>
              <p className="text-sm">{latest?.carbsG ?? 0}g / {goal.carbsG}g</p>
              <ProgressBar value={latest?.carbsG ?? 0} max={goal.carbsG} />
            </div>
            <div>
              <p className="text-sm text-muted">Zsír</p>
              <p className="text-sm">{latest?.fatG ?? 0}g / {goal.fatG}g</p>
              <ProgressBar value={latest?.fatG ?? 0} max={goal.fatG} />
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">Az edződ még nem állított be célokat.</p>
        )}
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">Napi log</h3>
        <form action={saveLog} className="mt-4 grid gap-4 md:grid-cols-2">
          <Input name="date" type="date" />
          <Input name="kcal" type="number" placeholder="Kalória" />
          <Input name="proteinG" type="number" placeholder="Fehérje (g)" />
          <Input name="carbsG" type="number" placeholder="Szénhidrát (g)" />
          <Input name="fatG" type="number" placeholder="Zsír (g)" />
          <Textarea name="note" placeholder="Megjegyzés" />
          <Button type="submit">Mentés</Button>
        </form>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">Utolsó 7 nap</h3>
        <ul className="mt-4 space-y-2 text-sm text-muted">
          {logs.map((log) => (
            <li key={log.id}>
              {log.date.toLocaleDateString("hu-HU")} · {log.kcal} kcal · P{log.proteinG} C{log.carbsG} F{log.fatG}
            </li>
          ))}
          {!logs.length ? <li>Nincs még log.</li> : null}
        </ul>
      </Card>
    </div>
  );
}
