import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/hash";
import { acceptInviteSchema } from "@/lib/validators";
import { createSession } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default async function InvitePage({
  params,
  searchParams
}: {
  params: { token: string };
  searchParams: { error?: string };
}) {
  const invite = await db.invite.findUnique({ where: { token: params.token } });

  if (!invite || invite.usedAt || invite.expiresAt < new Date()) {
    return (
      <main className="mx-auto w-[92%] max-w-md py-12">
        <Card>
          <h1 className="text-2xl font-display">Érvénytelen meghívó</h1>
          <p className="mt-2 text-sm text-muted">A meghívó lejárt vagy már felhasználásra került.</p>
        </Card>
      </main>
    );
  }

  async function accept(formData: FormData) {
    "use server";
    const parsed = acceptInviteSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password")
    });

    if (!parsed.success) {
      redirect(`/invite/${params.token}?error=${encodeURIComponent(parsed.error.errors[0].message)}`);
    }

    const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
    if (existing) {
      redirect(`/invite/${params.token}?error=Ez%20az%20email%20m%C3%A1r%20regisztr%C3%A1lt.`);
    }

    const user = await db.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash: await hashPassword(parsed.data.password),
        role: "CLIENT",
        notificationPreference: {
          create: {
            emailNewCheckin: true,
            emailNewMessage: true
          }
        }
      }
    });

    await db.coachClient.create({
      data: {
        coachId: invite.coachId,
        clientId: user.id,
        status: "ACTIVE"
      }
    });

    await db.invite.update({
      where: { id: invite.id },
      data: { usedAt: new Date() }
    });

    await createSession(user.id);
    redirect("/app/client/today");
  }

  return (
    <main className="mx-auto w-[92%] max-w-md py-12">
      <Card>
        <h1 className="text-2xl font-display">Csatlakozás az edződhöz</h1>
        {searchParams.error ? (
          <p className="mt-2 text-sm text-rose-600">{searchParams.error}</p>
        ) : null}
        <form action={accept} className="mt-6 grid gap-4">
          <label className="text-sm font-semibold">
            Név
            <Input name="name" placeholder="Teljes név" />
          </label>
          <label className="text-sm font-semibold">
            Email
            <Input name="email" type="email" defaultValue={invite.email} readOnly />
          </label>
          <label className="text-sm font-semibold">
            Jelszó
            <Input name="password" type="password" placeholder="Legalább 6 karakter" />
          </label>
          <Button type="submit">Fiók létrehozása</Button>
        </form>
      </Card>
    </main>
  );
}
