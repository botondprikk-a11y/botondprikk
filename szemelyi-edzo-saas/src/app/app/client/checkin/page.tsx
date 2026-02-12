import { redirect } from "next/navigation";
import { requireClient } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkInSchema } from "@/lib/validators";
import { getWeekKey } from "@/lib/date";
import { sendNotificationEmail } from "@/lib/mailer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Topbar } from "@/components/layout/Topbar";

export default async function CheckinPage() {
  const client = await requireClient();
  const weekKey = getWeekKey();
  const existing = await db.checkIn.findUnique({
    where: { clientId_weekKey: { clientId: client.id, weekKey } }
  });

  async function submitCheckin(formData: FormData) {
    "use server";
    const parsed = checkInSchema.safeParse({
      weekKey: formData.get("weekKey"),
      weight: formData.get("weight"),
      stepsAvg: formData.get("stepsAvg"),
      sleepQuality: formData.get("sleepQuality"),
      stress: formData.get("stress"),
      energy: formData.get("energy"),
      hunger: formData.get("hunger"),
      adherence: formData.get("adherence"),
      note: formData.get("note")
    });

    if (!parsed.success) {
      redirect("/app/client/checkin");
    }

    await db.checkIn.upsert({
      where: { clientId_weekKey: { clientId: client.id, weekKey: parsed.data.weekKey } },
      update: {
        weight: parsed.data.weight,
        stepsAvg: parsed.data.stepsAvg,
        sleepQuality: parsed.data.sleepQuality,
        stress: parsed.data.stress,
        energy: parsed.data.energy,
        hunger: parsed.data.hunger,
        adherence: parsed.data.adherence,
        note: parsed.data.note
      },
      create: {
        clientId: client.id,
        weekKey: parsed.data.weekKey,
        weight: parsed.data.weight,
        stepsAvg: parsed.data.stepsAvg,
        sleepQuality: parsed.data.sleepQuality,
        stress: parsed.data.stress,
        energy: parsed.data.energy,
        hunger: parsed.data.hunger,
        adherence: parsed.data.adherence,
        note: parsed.data.note
      }
    });

    const relation = await db.coachClient.findFirst({
      where: { clientId: client.id },
      include: { coach: true }
    });

    if (relation) {
      const pref = await db.notificationPreference.findUnique({ where: { userId: relation.coachId } });
      if (pref?.emailNewCheckin) {
        await sendNotificationEmail(
          relation.coach.email,
          "Új heti check-in",
          "A vendéged kitöltötte a heti check-int."
        );
      }
    }

    redirect("/app/client/checkin");
  }

  return (
    <div className="space-y-8">
      <Topbar title="Heti check-in" />

      <Card>
        <h3 className="text-lg font-semibold">{weekKey}</h3>
        {existing ? (
          <div className="mt-4 text-sm text-muted">
            <p>Check-in leadva.</p>
            <p>Edzői komment: {existing.coachComment ?? "-"}</p>
            <p>Következő hét fókusz: {existing.nextWeekFocus ?? "-"}</p>
          </div>
        ) : (
          <form action={submitCheckin} className="mt-4 grid gap-4 md:grid-cols-2">
            <input type="hidden" name="weekKey" value={weekKey} />
            <Input name="weight" type="number" step="0.1" placeholder="Testsúly (opcionális)" />
            <Input name="stepsAvg" type="number" placeholder="Átlag lépésszám" />
            <Input name="sleepQuality" type="number" placeholder="Alvás minőség 1-5" />
            <Input name="stress" type="number" placeholder="Stressz 1-5" />
            <Input name="energy" type="number" placeholder="Energia 1-5" />
            <Input name="hunger" type="number" placeholder="Éhség 1-5" />
            <Input name="adherence" type="number" placeholder="Terv tartása 1-5" />
            <Textarea name="note" placeholder="Megjegyzés" />
            <Button type="submit">Leadás</Button>
          </form>
        )}
      </Card>
    </div>
  );
}
