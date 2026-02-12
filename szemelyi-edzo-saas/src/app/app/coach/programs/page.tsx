import { redirect } from "next/navigation";
import { requireCoach } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  programTemplateSchema,
  programDaySchema,
  programExerciseSchema
} from "@/lib/validators";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Topbar } from "@/components/layout/Topbar";

export default async function CoachProgramsPage({ searchParams }: { searchParams: { error?: string } }) {
  const coach = await requireCoach();
  const templates = await db.programTemplate.findMany({
    where: { coachId: coach.id },
    include: { days: { include: { exercises: true } } },
    orderBy: { createdAt: "desc" }
  });
  const clients = await db.coachClient.findMany({
    where: { coachId: coach.id, status: "ACTIVE" },
    include: { client: true }
  });

  async function createTemplate(formData: FormData) {
    "use server";
    const parsed = programTemplateSchema.safeParse({
      name: formData.get("name"),
      description: formData.get("description")
    });

    if (!parsed.success) {
      redirect(`/app/coach/programs?error=${encodeURIComponent(parsed.error.errors[0].message)}`);
    }

    await db.programTemplate.create({
      data: {
        coachId: coach.id,
        name: parsed.data.name,
        description: parsed.data.description
      }
    });

    redirect("/app/coach/programs");
  }

  async function addDay(formData: FormData) {
    "use server";
    const parsed = programDaySchema.safeParse({
      dayName: formData.get("dayName"),
      order: formData.get("order")
    });

    const templateId = String(formData.get("templateId"));

    if (!parsed.success || !templateId) {
      redirect("/app/coach/programs?error=Hib%C3%A1s%20nap%20adat.");
    }

    await db.programDay.create({
      data: {
        templateId,
        dayName: parsed.data.dayName,
        order: parsed.data.order
      }
    });

    redirect("/app/coach/programs");
  }

  async function addExercise(formData: FormData) {
    "use server";
    const parsed = programExerciseSchema.safeParse({
      name: formData.get("name"),
      notes: formData.get("notes"),
      targetSets: formData.get("targetSets"),
      targetReps: formData.get("targetReps"),
      restSec: formData.get("restSec"),
      targetRpe: formData.get("targetRpe")
    });

    const dayId = String(formData.get("dayId"));

    if (!parsed.success || !dayId) {
      redirect("/app/coach/programs?error=Hib%C3%A1s%20gyakorlat%20adat.");
    }

    await db.programExercise.create({
      data: {
        dayId,
        name: parsed.data.name,
        notes: parsed.data.notes,
        targetSets: parsed.data.targetSets,
        targetReps: parsed.data.targetReps,
        restSec: parsed.data.restSec,
        targetRpe: parsed.data.targetRpe
      }
    });

    redirect("/app/coach/programs");
  }

  async function assignProgram(formData: FormData) {
    "use server";
    const templateId = String(formData.get("templateId"));
    const clientId = String(formData.get("clientId"));

    if (!templateId || !clientId) {
      redirect("/app/coach/programs?error=Hib%C3%A1s%20hozz%C3%A1rendel%C3%A9s.");
    }

    await db.clientProgram.upsert({
      where: {
        clientId_templateId: { clientId, templateId }
      },
      update: {
        assignedAt: new Date()
      },
      create: {
        clientId,
        templateId
      }
    });

    redirect("/app/coach/programs");
  }

  const days = templates.flatMap((t) => t.days);

  return (
    <div className="space-y-8">
      <Topbar title="Programok" />
      {searchParams.error ? <p className="text-sm text-rose-600">{searchParams.error}</p> : null}

      <Card>
        <h3 className="text-lg font-semibold">Új program sablon</h3>
        <form action={createTemplate} className="mt-4 grid gap-4">
          <Input name="name" placeholder="Program neve" />
          <Textarea name="description" placeholder="Rövid leírás" />
          <Button type="submit">Sablon létrehozása</Button>
        </form>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">Nap hozzáadása</h3>
        <form action={addDay} className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
          <Select name="templateId" defaultValue="">
            <option value="" disabled>Válassz sablont</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </Select>
          <div className="grid gap-2">
            <Input name="dayName" placeholder="Nap (pl. Hétfő)" />
            <Input name="order" type="number" placeholder="Sorrend" />
          </div>
          <Button type="submit">Hozzáadás</Button>
        </form>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">Gyakorlat hozzáadása</h3>
        <form action={addExercise} className="mt-4 grid gap-4">
          <Select name="dayId" defaultValue="">
            <option value="" disabled>Válassz napot</option>
            {days.map((day) => (
              <option key={day.id} value={day.id}>
                {day.dayName}
              </option>
            ))}
          </Select>
          <Input name="name" placeholder="Gyakorlat neve" />
          <div className="grid gap-3 md:grid-cols-4">
            <Input name="targetSets" type="number" placeholder="Sorozat" />
            <Input name="targetReps" placeholder="Ismétlés" />
            <Input name="restSec" type="number" placeholder="Pihenő (mp)" />
            <Input name="targetRpe" type="number" placeholder="RPE" />
          </div>
          <Textarea name="notes" placeholder="Megjegyzés" />
          <Button type="submit">Mentés</Button>
        </form>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">Program hozzárendelése vendéghez</h3>
        <form action={assignProgram} className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
          <Select name="templateId" defaultValue="">
            <option value="" disabled>Program</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </Select>
          <Select name="clientId" defaultValue="">
            <option value="" disabled>Vendég</option>
            {clients.map((relation) => (
              <option key={relation.clientId} value={relation.clientId}>
                {relation.client.name}
              </option>
            ))}
          </Select>
          <Button type="submit">Hozzárendelés</Button>
        </form>
      </Card>

      <section className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <h3 className="text-lg font-semibold">{template.name}</h3>
            <p className="text-sm text-muted">{template.description}</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {template.days.map((day) => (
                <div key={day.id} className="rounded-xl border border-border p-4">
                  <p className="font-semibold">{day.dayName}</p>
                  <ul className="mt-2 space-y-1 text-sm text-muted">
                    {day.exercises.map((ex) => (
                      <li key={ex.id}>{ex.name}</li>
                    ))}
                  </ul>
                </div>
              ))}
              {!template.days.length ? (
                <p className="text-sm text-muted">Nincs még nap hozzáadva.</p>
              ) : null}
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
