import { redirect } from "next/navigation";
import { requireClient } from "@/lib/auth";
import { db } from "@/lib/db";
import { weightLogSchema } from "@/lib/validators";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { WeightChart } from "@/components/charts/WeightChart";
import { PhotoUpload } from "@/components/layout/PhotoUpload";
import { Topbar } from "@/components/layout/Topbar";

export default async function ProgressPage() {
  const client = await requireClient();
  const weightLogs = await db.weightLog.findMany({
    where: { clientId: client.id },
    orderBy: { date: "asc" }
  });
  const photos = await db.progressPhoto.findMany({
    where: { clientId: client.id },
    orderBy: { uploadedAt: "desc" },
    take: 12
  });

  async function saveWeight(formData: FormData) {
    "use server";
    const parsed = weightLogSchema.safeParse({
      date: formData.get("date"),
      kg: formData.get("kg")
    });

    if (!parsed.success) {
      redirect("/app/client/progress");
    }

    const date = new Date(parsed.data.date);

    await db.weightLog.upsert({
      where: { clientId_date: { clientId: client.id, date } },
      update: { kg: parsed.data.kg },
      create: { clientId: client.id, date, kg: parsed.data.kg }
    });

    redirect("/app/client/progress");
  }

  return (
    <div className="space-y-8">
      <Topbar title="Progress" />

      <Card>
        <h3 className="text-lg font-semibold">Testsúly</h3>
        <div className="mt-4">
          <WeightChart data={weightLogs.map((log) => ({ date: log.date.toISOString().slice(0, 10), kg: log.kg }))} />
        </div>
        <form action={saveWeight} className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
          <Input name="date" type="date" />
          <Input name="kg" type="number" step="0.1" placeholder="Testsúly (kg)" />
          <Button type="submit">Mentés</Button>
        </form>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">Progress fotók</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_2fr]">
          <PhotoUpload />
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {photos.map((photo) => (
              <div key={photo.id} className="overflow-hidden rounded-xl border border-border">
                <img src={photo.filePath} alt="Progress" className="h-32 w-full object-cover" />
              </div>
            ))}
            {!photos.length ? <p className="text-sm text-muted">Még nincs fotó.</p> : null}
          </div>
        </div>
      </Card>
    </div>
  );
}
