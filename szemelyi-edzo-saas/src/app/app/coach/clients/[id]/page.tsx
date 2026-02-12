import { redirect } from "next/navigation";
import { requireCoach } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureCoachClientAccess } from "@/lib/access";
import { coachCheckInSchema, messageSchema, nutritionGoalSchema } from "@/lib/validators";
import { sendNotificationEmail } from "@/lib/mailer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { WeightChart } from "@/components/charts/WeightChart";
import { OneRmChart } from "@/components/charts/OneRmChart";
import { Topbar } from "@/components/layout/Topbar";

export default async function CoachClientProfile({ params }: { params: { id: string } }) {
  const coach = await requireCoach();
  await ensureCoachClientAccess(coach.id, params.id);

  const client = await db.user.findUnique({ where: { id: params.id } });
  if (!client) redirect("/app/coach/clients");

  const nutritionGoal = await db.nutritionGoal.findFirst({ where: { clientId: client.id } });
  const nutritionLogs = await db.nutritionLog.findMany({
    where: { clientId: client.id },
    orderBy: { date: "desc" },
    take: 7
  });
  const weeklyAvgKcal =
    nutritionLogs.length > 0
      ? Math.round(nutritionLogs.reduce((sum, log) => sum + log.kcal, 0) / nutritionLogs.length)
      : 0;
  const weightLogs = await db.weightLog.findMany({
    where: { clientId: client.id },
    orderBy: { date: "asc" }
  });
  const workoutSessions = await db.workoutSession.findMany({
    where: { clientId: client.id },
    include: { sets: true },
    orderBy: { date: "desc" },
    take: 7
  });
  const checkIns = await db.checkIn.findMany({
    where: { clientId: client.id },
    orderBy: { createdAt: "desc" },
    take: 5
  });
  const photos = await db.progressPhoto.findMany({
    where: { clientId: client.id },
    orderBy: { uploadedAt: "desc" },
    take: 9
  });

  const messages = await db.message.findMany({
    where: {
      OR: [
        { senderId: coach.id, receiverId: client.id },
        { senderId: client.id, receiverId: coach.id }
      ]
    },
    orderBy: { createdAt: "desc" },
    take: 20
  });

  const oneRmLogs = await db.workoutSetLog.findMany({
    where: { session: { clientId: client.id } },
    select: { oneRmEstimate: true, exerciseName: true, session: { select: { date: true } } }
  });

  const exerciseCount = new Map<string, number>();
  oneRmLogs.forEach((log) => {
    exerciseCount.set(log.exerciseName, (exerciseCount.get(log.exerciseName) ?? 0) + 1);
  });
  const topExercise = Array.from(exerciseCount.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
  const oneRmData = oneRmLogs
    .filter((log) => log.exerciseName === topExercise)
    .reduce<Record<string, number>>((acc, log) => {
      const dateKey = log.session.date.toISOString().slice(0, 10);
      acc[dateKey] = Math.max(acc[dateKey] ?? 0, log.oneRmEstimate);
      return acc;
    }, {});
  const oneRmChart = Object.entries(oneRmData).map(([date, oneRm]) => ({ date, oneRm }));

  async function saveCoachCheckin(formData: FormData) {
    "use server";
    const checkInId = String(formData.get("checkInId"));
    const parsed = coachCheckInSchema.safeParse({
      coachComment: formData.get("coachComment"),
      nextWeekFocus: formData.get("nextWeekFocus")
    });

    if (!parsed.success || !checkInId) {
      redirect(`/app/coach/clients/${params.id}`);
    }

    await db.checkIn.update({
      where: { id: checkInId },
      data: {
        coachComment: parsed.data.coachComment,
        nextWeekFocus: parsed.data.nextWeekFocus
      }
    });

    redirect(`/app/coach/clients/${params.id}`);
  }

  async function sendMessage(formData: FormData) {
    "use server";
    const parsed = messageSchema.safeParse({
      content: formData.get("content")
    });

    if (!parsed.success) {
      redirect(`/app/coach/clients/${params.id}`);
    }

    await db.message.create({
      data: {
        senderId: coach.id,
        receiverId: client.id,
        content: parsed.data.content
      }
    });

    const pref = await db.notificationPreference.findUnique({ where: { userId: client.id } });
    if (pref?.emailNewMessage) {
      await sendNotificationEmail(
        client.email,
        "Új üzenet az edződtől",
        "Új üzenetet kaptál az edződtől."
      );
    }

    redirect(`/app/coach/clients/${params.id}`);
  }

  async function saveGoal(formData: FormData) {
    "use server";
    const parsed = nutritionGoalSchema.safeParse({
      kcal: formData.get("kcal"),
      proteinG: formData.get("proteinG"),
      carbsG: formData.get("carbsG"),
      fatG: formData.get("fatG")
    });

    if (!parsed.success) {
      redirect(`/app/coach/clients/${params.id}`);
    }

    await db.nutritionGoal.upsert({
      where: { clientId: client.id },
      update: {
        kcal: parsed.data.kcal,
        proteinG: parsed.data.proteinG,
        carbsG: parsed.data.carbsG,
        fatG: parsed.data.fatG,
        updatedAt: new Date()
      },
      create: {
        clientId: client.id,
        kcal: parsed.data.kcal,
        proteinG: parsed.data.proteinG,
        carbsG: parsed.data.carbsG,
        fatG: parsed.data.fatG
      }
    });

    redirect(`/app/coach/clients/${params.id}`);
  }

  return (
    <div className="space-y-8">
      <Topbar title={`Profil · ${client.name}`} />

      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <p className="text-sm text-muted">Email</p>
          <p className="text-lg font-semibold">{client.email}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Táplálkozás cél</p>
          <p className="text-sm">
            {nutritionGoal
              ? `${nutritionGoal.kcal} kcal · P ${nutritionGoal.proteinG}g · C ${nutritionGoal.carbsG}g · F ${nutritionGoal.fatG}g`
              : "Nincs megadva"}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Edzés logok (7 nap)</p>
          <p className="text-2xl font-semibold">{workoutSessions.length}</p>
        </Card>
      </section>

      <Card>
        <h3 className="text-lg font-semibold">Táplálkozási cél beállítása</h3>
        <form action={saveGoal} className="mt-4 grid gap-4 md:grid-cols-2">
          <Input name="kcal" type="number" placeholder="Kalória" defaultValue={nutritionGoal?.kcal ?? ""} />
          <Input name="proteinG" type="number" placeholder="Fehérje (g)" defaultValue={nutritionGoal?.proteinG ?? ""} />
          <Input name="carbsG" type="number" placeholder="Szénhidrát (g)" defaultValue={nutritionGoal?.carbsG ?? ""} />
          <Input name="fatG" type="number" placeholder="Zsír (g)" defaultValue={nutritionGoal?.fatG ?? ""} />
          <Button type="submit" variant="outline">Mentés</Button>
        </form>
      </Card>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold">Testsúly trend</h3>
          <div className="mt-4">
            <WeightChart data={weightLogs.map((log) => ({ date: log.date.toISOString().slice(0, 10), kg: log.kg }))} />
          </div>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold">1RM trend {topExercise ? `· ${topExercise}` : ""}</h3>
          <div className="mt-4">
            <OneRmChart data={oneRmChart} />
          </div>
        </Card>
      </section>

      <Card>
        <h3 className="text-lg font-semibold">Napi edzések</h3>
        <div className="mt-4">
          <Table>
            <THead>
              <TR>
                <TH>Dátum</TH>
                <TH>Állapot</TH>
                <TH>Megjegyzés</TH>
              </TR>
            </THead>
            <TBody>
              {workoutSessions.map((session) => (
                <TR key={session.id}>
                  <TD>{session.date.toLocaleDateString("hu-HU")}</TD>
                  <TD>{session.completedAt ? "Kész" : "Folyamatban"}</TD>
                  <TD className="text-sm text-muted">{session.notes ?? "-"}</TD>
                </TR>
              ))}
              {!workoutSessions.length ? (
                <TR>
                  <TD colSpan={3} className="text-muted">Nincs még log.</TD>
                </TR>
              ) : null}
            </TBody>
          </Table>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">Táplálkozás (utolsó 7 nap)</h3>
        <p className="mt-2 text-sm text-muted">Heti átlag: {weeklyAvgKcal} kcal</p>
        <div className="mt-4">
          <Table>
            <THead>
              <TR>
                <TH>Dátum</TH>
                <TH>Kalória</TH>
                <TH>Makrók</TH>
                <TH>Megjegyzés</TH>
              </TR>
            </THead>
            <TBody>
              {nutritionLogs.map((log) => (
                <TR key={log.id}>
                  <TD>{log.date.toLocaleDateString("hu-HU")}</TD>
                  <TD>{log.kcal}</TD>
                  <TD>{`P${log.proteinG} C${log.carbsG} F${log.fatG}`}</TD>
                  <TD className="text-sm text-muted">{log.note ?? "-"}</TD>
                </TR>
              ))}
              {!nutritionLogs.length ? (
                <TR>
                  <TD colSpan={4} className="text-muted">Nincs log.</TD>
                </TR>
              ) : null}
            </TBody>
          </Table>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">Check-in</h3>
        <div className="mt-4 grid gap-6">
          {checkIns.map((checkIn) => (
            <div key={checkIn.id} className="rounded-xl border border-border p-4">
              <p className="text-sm text-muted">{checkIn.weekKey}</p>
              <p className="text-sm">
                Lépés: {checkIn.stepsAvg} · Alvás: {checkIn.sleepQuality}/5 · Stressz: {checkIn.stress}/5
              </p>
              <p className="text-sm">Energia: {checkIn.energy}/5 · Éhség: {checkIn.hunger}/5</p>
              <p className="mt-2 text-sm text-muted">{checkIn.note ?? "-"}</p>
              <form action={saveCoachCheckin} className="mt-4 grid gap-3">
                <input type="hidden" name="checkInId" value={checkIn.id} />
                <Textarea name="coachComment" placeholder="Edzői komment" defaultValue={checkIn.coachComment ?? ""} />
                <Textarea name="nextWeekFocus" placeholder="Következő hét fókusz" defaultValue={checkIn.nextWeekFocus ?? ""} />
                <Button type="submit" variant="outline">Mentés</Button>
              </form>
            </div>
          ))}
          {!checkIns.length ? <p className="text-sm text-muted">Nincs még check-in.</p> : null}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">Üzenetek</h3>
        <div className="mt-4 grid gap-3">
          {messages.map((msg) => (
            <div key={msg.id} className="rounded-xl border border-border p-3">
              <p className="text-xs text-muted">
                {msg.senderId === coach.id ? "Te" : client.name} · {msg.createdAt.toLocaleString("hu-HU")}
              </p>
              <p className="text-sm">{msg.content}</p>
            </div>
          ))}
          {!messages.length ? <p className="text-sm text-muted">Nincs üzenet.</p> : null}
          <form action={sendMessage} className="grid gap-3">
            <Textarea name="content" placeholder="Írj üzenetet..." />
            <Button type="submit">Küldés</Button>
          </form>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">Progress fotók</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {photos.map((photo) => (
            <div key={photo.id} className="overflow-hidden rounded-xl border border-border">
              <img src={photo.filePath} alt="Progress" className="h-40 w-full object-cover" />
            </div>
          ))}
          {!photos.length ? <p className="text-sm text-muted">Nincs fotó.</p> : null}
        </div>
      </Card>
    </div>
  );
}
