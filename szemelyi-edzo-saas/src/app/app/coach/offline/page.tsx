import { redirect } from "next/navigation";
import { requireCoach } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  offlinePackageSchema,
  offlineSessionSchema,
  offlinePaymentSchema
} from "@/lib/validators";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Topbar } from "@/components/layout/Topbar";

export default async function OfflinePage({ searchParams }: { searchParams: { error?: string } }) {
  const coach = await requireCoach();
  const packages = await db.offlinePackage.findMany({
    where: { coachId: coach.id },
    include: { sessions: true, payments: true },
    orderBy: { clientName: "asc" }
  });

  async function createPackage(formData: FormData) {
    "use server";
    const parsed = offlinePackageSchema.safeParse({
      clientName: formData.get("clientName"),
      type: formData.get("type"),
      price: formData.get("price"),
      totalSessions: formData.get("totalSessions"),
      sessionsLeft: formData.get("sessionsLeft"),
      expiryDate: formData.get("expiryDate")
    });

    if (!parsed.success) {
      redirect(`/app/coach/offline?error=${encodeURIComponent(parsed.error.errors[0].message)}`);
    }

    await db.offlinePackage.create({
      data: {
        coachId: coach.id,
        clientName: parsed.data.clientName,
        type: parsed.data.type,
        price: parsed.data.price,
        totalSessions: parsed.data.totalSessions,
        sessionsLeft: parsed.data.sessionsLeft,
        expiryDate: parsed.data.expiryDate ? new Date(parsed.data.expiryDate) : null
      }
    });

    redirect("/app/coach/offline");
  }

  async function addSession(formData: FormData) {
    "use server";
    const parsed = offlineSessionSchema.safeParse({
      date: formData.get("date"),
      status: formData.get("status"),
      note: formData.get("note")
    });
    const packageId = String(formData.get("packageId"));

    if (!parsed.success || !packageId) {
      redirect("/app/coach/offline?error=Hib%C3%A1s%20alkalom%20adat.");
    }

    await db.offlineSession.create({
      data: {
        packageId,
        date: new Date(parsed.data.date),
        status: parsed.data.status,
        note: parsed.data.note
      }
    });

    if (parsed.data.status === "HELD") {
      await db.offlinePackage.update({
        where: { id: packageId },
        data: { sessionsLeft: { decrement: 1 } }
      });
    }

    redirect("/app/coach/offline");
  }

  async function addPayment(formData: FormData) {
    "use server";
    const parsed = offlinePaymentSchema.safeParse({
      date: formData.get("date"),
      amount: formData.get("amount"),
      note: formData.get("note")
    });
    const packageId = String(formData.get("packageId"));

    if (!parsed.success || !packageId) {
      redirect("/app/coach/offline?error=Hib%C3%A1s%20fizet%C3%A9s%20adat.");
    }

    await db.offlinePayment.create({
      data: {
        packageId,
        date: new Date(parsed.data.date),
        amount: parsed.data.amount,
        note: parsed.data.note
      }
    });

    redirect("/app/coach/offline");
  }

  return (
    <div className="space-y-8">
      <Topbar title="Offline PT" />
      {searchParams.error ? <p className="text-sm text-rose-600">{searchParams.error}</p> : null}

      <Card>
        <h3 className="text-lg font-semibold">Új bérlet</h3>
        <form action={createPackage} className="mt-4 grid gap-4 md:grid-cols-2">
          <Input name="clientName" placeholder="Vendég neve" />
          <Input name="type" placeholder="Típus (pl. 10 alkalmas)" />
          <Input name="price" type="number" placeholder="Ár (Ft)" />
          <Input name="totalSessions" type="number" placeholder="Összes alkalom" />
          <Input name="sessionsLeft" type="number" placeholder="Maradék alkalom" />
          <Input name="expiryDate" type="date" />
          <Button type="submit">Mentés</Button>
        </form>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">Alkalom rögzítése</h3>
        <form action={addSession} className="mt-4 grid gap-4 md:grid-cols-2">
          <Select name="packageId" defaultValue="">
            <option value="" disabled>Válassz bérletet</option>
            {packages.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.clientName} · {pkg.type}
              </option>
            ))}
          </Select>
          <Input name="date" type="date" />
          <Select name="status" defaultValue="HELD">
            <option value="HELD">Megtartva</option>
            <option value="CANCELLED">Lemondva</option>
            <option value="NO_SHOW">No-show</option>
          </Select>
          <Textarea name="note" placeholder="Megjegyzés" />
          <Button type="submit">Rögzítés</Button>
        </form>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">Fizetés rögzítése</h3>
        <form action={addPayment} className="mt-4 grid gap-4 md:grid-cols-2">
          <Select name="packageId" defaultValue="">
            <option value="" disabled>Válassz bérletet</option>
            {packages.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.clientName} · {pkg.type}
              </option>
            ))}
          </Select>
          <Input name="date" type="date" />
          <Input name="amount" type="number" placeholder="Összeg" />
          <Textarea name="note" placeholder="Megjegyzés" />
          <Button type="submit">Mentés</Button>
        </form>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">Bérletek</h3>
        <div className="mt-4">
          <Table>
            <THead>
              <TR>
                <TH>Vendég</TH>
                <TH>Típus</TH>
                <TH>Maradék</TH>
                <TH>Lejárat</TH>
              </TR>
            </THead>
            <TBody>
              {packages.map((pkg) => (
                <TR key={pkg.id}>
                  <TD>{pkg.clientName}</TD>
                  <TD>{pkg.type}</TD>
                  <TD>{pkg.sessionsLeft}</TD>
                  <TD>{pkg.expiryDate ? pkg.expiryDate.toLocaleDateString("hu-HU") : "-"}</TD>
                </TR>
              ))}
              {!packages.length ? (
                <TR>
                  <TD colSpan={4} className="text-muted">Nincs még bérlet.</TD>
                </TR>
              ) : null}
            </TBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
