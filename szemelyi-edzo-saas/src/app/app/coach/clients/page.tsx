import { redirect } from "next/navigation";
import Link from "next/link";
import { randomBytes } from "crypto";
import { requireCoach } from "@/lib/auth";
import { db } from "@/lib/db";
import { inviteSchema } from "@/lib/validators";
import { sendInviteEmail } from "@/lib/mailer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Topbar } from "@/components/layout/Topbar";

export default async function CoachClientsPage({ searchParams }: { searchParams: { error?: string } }) {
  const coach = await requireCoach();
  const invites = await db.invite.findMany({
    where: { coachId: coach.id, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" }
  });

  const clients = await db.coachClient.findMany({
    where: { coachId: coach.id },
    include: { client: true }
  });

  async function createInvite(formData: FormData) {
    "use server";
    const parsed = inviteSchema.safeParse({
      email: formData.get("email"),
      name: formData.get("name")
    });

    if (!parsed.success) {
      redirect(`/app/coach/clients?error=${encodeURIComponent(parsed.error.errors[0].message)}`);
    }

    const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
    if (existing) {
      redirect("/app/coach/clients?error=Ez%20az%20email%20m%C3%A1r%20regisztr%C3%A1lt.");
    }

    const token = randomBytes(24).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invite = await db.invite.create({
      data: {
        coachId: coach.id,
        email: parsed.data.email,
        name: parsed.data.name,
        token,
        expiresAt
      }
    });

    const appUrl = process.env.APP_URL ?? "http://localhost:3000";
    await sendInviteEmail(invite.email, `${appUrl}/invite/${invite.token}`);

    redirect("/app/coach/clients");
  }

  async function resendInvite(formData: FormData) {
    "use server";
    const inviteId = String(formData.get("inviteId"));
    const token = randomBytes(24).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invite = await db.invite.update({
      where: { id: inviteId },
      data: { token, expiresAt, usedAt: null }
    });

    const appUrl = process.env.APP_URL ?? "http://localhost:3000";
    await sendInviteEmail(invite.email, `${appUrl}/invite/${invite.token}`);

    redirect("/app/coach/clients");
  }

  async function toggleStatus(formData: FormData) {
    "use server";
    const relationId = String(formData.get("relationId"));
    const status = String(formData.get("status"));

    await db.coachClient.update({
      where: { id: relationId },
      data: { status: status === "ACTIVE" ? "PAUSED" : "ACTIVE" }
    });

    redirect("/app/coach/clients");
  }

  return (
    <div className="space-y-8">
      <Topbar title="Vendégek" />
      {searchParams.error ? (
        <p className="text-sm text-rose-600">{searchParams.error}</p>
      ) : null}

      <Card>
        <h3 className="text-lg font-semibold">Új vendég meghívása</h3>
        <form action={createInvite} className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
          <Input name="email" type="email" placeholder="email@pelda.hu" />
          <Input name="name" placeholder="Név (opcionális)" />
          <Button type="submit">Meghívás</Button>
        </form>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">Meghívók</h3>
        <div className="mt-4">
          <Table>
            <THead>
              <TR>
                <TH>Email</TH>
                <TH>Lejárat</TH>
                <TH>Akció</TH>
              </TR>
            </THead>
            <TBody>
              {invites.map((invite) => (
                <TR key={invite.id}>
                  <TD>{invite.email}</TD>
                  <TD>{invite.expiresAt.toLocaleDateString("hu-HU")}</TD>
                  <TD>
                    <form action={resendInvite}>
                      <input type="hidden" name="inviteId" value={invite.id} />
                      <Button type="submit" variant="outline">Újraküldés</Button>
                    </form>
                  </TD>
                </TR>
              ))}
              {!invites.length ? (
                <TR>
                  <TD colSpan={3} className="text-muted">Nincs aktív meghívó.</TD>
                </TR>
              ) : null}
            </TBody>
          </Table>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">Aktív vendégek</h3>
        <div className="mt-4">
          <Table>
            <THead>
              <TR>
                <TH>Név</TH>
                <TH>Státusz</TH>
                <TH>Profil</TH>
                <TH>Akció</TH>
              </TR>
            </THead>
            <TBody>
              {clients.map((relation) => (
                <TR key={relation.id}>
                  <TD>{relation.client.name}</TD>
                  <TD>
                    <Badge variant={relation.status === "ACTIVE" ? "success" : "warning"}>
                      {relation.status === "ACTIVE" ? "Aktív" : "Szüneteltetett"}
                    </Badge>
                  </TD>
                  <TD>
                    <Link
                      href={`/app/coach/clients/${relation.clientId}`}
                      className="text-sm font-semibold text-accent"
                    >
                      Megnyitás
                    </Link>
                  </TD>
                  <TD>
                    <form action={toggleStatus}>
                      <input type="hidden" name="relationId" value={relation.id} />
                      <input type="hidden" name="status" value={relation.status} />
                      <Button type="submit" variant="outline">
                        {relation.status === "ACTIVE" ? "Szüneteltetés" : "Aktiválás"}
                      </Button>
                    </form>
                  </TD>
                </TR>
              ))}
              {!clients.length ? (
                <TR>
                  <TD colSpan={4} className="text-muted">Nincs még aktív vendég.</TD>
                </TR>
              ) : null}
            </TBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
