import { redirect } from "next/navigation";
import { requireClient } from "@/lib/auth";
import { db } from "@/lib/db";
import { workoutSetSchema } from "@/lib/validators";
import { estimateOneRm } from "@/lib/oneRm";
import { getDayName, startOfDay } from "@/lib/workout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Topbar } from "@/components/layout/Topbar";

export default async function TodayPage() {
  const client = await requireClient();
  const program = await db.clientProgram.findFirst({
    where: { clientId: client.id },
    include: {
      template: {
        include: { days: { include: { exercises: true }, orderBy: { order: "asc" } } }
      }
    }
  });

  const todayName = getDayName();
  const todayDay = program?.template.days.find((day) => day.dayName === todayName);
  const todayDate = startOfDay();

  const session = await db.workoutSession.findFirst({
    where: { clientId: client.id, date: todayDate },
    include: { sets: true }
  });

  async function logSet(formData: FormData) {
    "use server";
    const parsed = workoutSetSchema.safeParse({
      exerciseName: formData.get("exerciseName"),
      setIndex: formData.get("setIndex"),
      weight: formData.get("weight"),
      reps: formData.get("reps"),
      rpe: formData.get("rpe"),
      isPr: formData.get("isPr") === "on"
    });

    if (!parsed.success) {
      redirect("/app/client/today");
    }

    const today = startOfDay();
    const activeSession =
      (await db.workoutSession.findFirst({ where: { clientId: client.id, date: today } })) ||
      (await db.workoutSession.create({
        data: { clientId: client.id, date: today }
      }));

    await db.workoutSetLog.create({
      data: {
        sessionId: activeSession.id,
        exerciseName: parsed.data.exerciseName,
        setIndex: parsed.data.setIndex,
        weight: parsed.data.weight,
        reps: parsed.data.reps,
        rpe: parsed.data.rpe,
        isPr: parsed.data.isPr ?? false,
        oneRmEstimate: estimateOneRm(parsed.data.weight, parsed.data.reps)
      }
    });

    redirect("/app/client/today");
  }

  async function completeWorkout() {
    "use server";
    const today = startOfDay();
    await db.workoutSession.updateMany({
      where: { clientId: client.id, date: today },
      data: { completedAt: new Date() }
    });
    redirect("/app/client/today");
  }

  return (
    <div className="space-y-8">
      <Topbar title="Ma" />

      <Card>
        <h3 className="text-lg font-semibold">Mai edzés · {todayName}</h3>
        {todayDay ? (
          <div className="mt-4 space-y-3">
            {todayDay.exercises.map((exercise) => (
              <div key={exercise.id} className="rounded-xl border border-border p-4">
                <p className="font-semibold">{exercise.name}</p>
                <p className="text-sm text-muted">
                  {exercise.targetSets ? `${exercise.targetSets} sorozat` : ""} {exercise.targetReps ?? ""}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">Nincs beállított edzés erre a napra.</p>
        )}
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">Set log</h3>
        <form action={logSet} className="mt-4 grid gap-4 md:grid-cols-2">
          <Select name="exerciseName" defaultValue="">
            <option value="" disabled>Gyakorlat</option>
            {todayDay?.exercises.map((exercise) => (
              <option key={exercise.id} value={exercise.name}>
                {exercise.name}
              </option>
            ))}
          </Select>
          <Input name="setIndex" type="number" placeholder="Sorozat sorszám" />
          <Input name="weight" type="number" step="0.5" placeholder="Súly (kg)" />
          <Input name="reps" type="number" placeholder="Ismétlés" />
          <Input name="rpe" type="number" step="0.5" placeholder="RPE" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isPr" /> PR
          </label>
          <Button type="submit">Mentés</Button>
        </form>
        <form action={completeWorkout} className="mt-4">
          <Button type="submit" variant="outline">Edzés kész</Button>
        </form>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">Mai logok</h3>
        <div className="mt-4">
          <Table>
            <THead>
              <TR>
                <TH>Gyakorlat</TH>
                <TH>Set</TH>
                <TH>Súly</TH>
                <TH>Ismétlés</TH>
                <TH>1RM</TH>
              </TR>
            </THead>
            <TBody>
              {session?.sets.map((set) => (
                <TR key={set.id}>
                  <TD>{set.exerciseName}</TD>
                  <TD>{set.setIndex}</TD>
                  <TD>{set.weight}</TD>
                  <TD>{set.reps}</TD>
                  <TD>{set.oneRmEstimate}</TD>
                </TR>
              ))}
              {!session?.sets.length ? (
                <TR>
                  <TD colSpan={5} className="text-muted">Nincs még log.</TD>
                </TR>
              ) : null}
            </TBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
