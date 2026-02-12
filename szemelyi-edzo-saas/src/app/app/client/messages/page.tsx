import { redirect } from "next/navigation";
import { requireClient } from "@/lib/auth";
import { db } from "@/lib/db";
import { messageSchema } from "@/lib/validators";
import { sendNotificationEmail } from "@/lib/mailer";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Topbar } from "@/components/layout/Topbar";

export default async function ClientMessagesPage() {
  const client = await requireClient();
  const relation = await db.coachClient.findFirst({
    where: { clientId: client.id },
    include: { coach: true }
  });

  const messages = relation
    ? await db.message.findMany({
        where: {
          OR: [
            { senderId: client.id, receiverId: relation.coachId },
            { senderId: relation.coachId, receiverId: client.id }
          ]
        },
        orderBy: { createdAt: "desc" },
        take: 20
      })
    : [];

  const notification = await db.notificationPreference.findUnique({ where: { userId: client.id } });

  async function saveNotifications(formData: FormData) {
    "use server";
    const emailNewMessage = formData.get("emailNewMessage") === "on";

    await db.notificationPreference.upsert({
      where: { userId: client.id },
      update: { emailNewMessage },
      create: { userId: client.id, emailNewMessage, emailNewCheckin: true }
    });
  }

  async function sendMessage(formData: FormData) {
    "use server";
    if (!relation) {
      redirect("/app/client/messages");
    }
    const parsed = messageSchema.safeParse({
      content: formData.get("content")
    });

    if (!parsed.success) {
      redirect("/app/client/messages");
    }

    await db.message.create({
      data: {
        senderId: client.id,
        receiverId: relation.coachId,
        content: parsed.data.content
      }
    });

    const pref = await db.notificationPreference.findUnique({ where: { userId: relation.coachId } });
    if (pref?.emailNewMessage) {
      await sendNotificationEmail(
        relation.coach.email,
        "Új üzenet a vendégedtől",
        "Új üzenetet kaptál a vendégedtől."
      );
    }

    redirect("/app/client/messages");
  }

  return (
    <div className="space-y-8">
      <Topbar title="Üzenetek" />
      <Card>
        <h3 className="text-lg font-semibold">Chat {relation ? `· ${relation.coach.name}` : ""}</h3>
        <div className="mt-4 grid gap-3">
          {relation ? (
            <>
              {messages.map((msg) => (
                <div key={msg.id} className="rounded-xl border border-border p-3">
                  <p className="text-xs text-muted">
                    {msg.senderId === client.id ? "Te" : relation.coach.name} · {msg.createdAt.toLocaleString("hu-HU")}
                  </p>
                  <p className="text-sm">{msg.content}</p>
                </div>
              ))}
              {!messages.length ? <p className="text-sm text-muted">Nincs üzenet.</p> : null}
              <form action={sendMessage} className="grid gap-3">
                <Textarea name="content" placeholder="Írj üzenetet..." />
                <Button type="submit">Küldés</Button>
              </form>
            </>
          ) : (
            <p className="text-sm text-muted">Még nincs edző kapcsolat.</p>
          )}
        </div>
      </Card>
      <Card>
        <h3 className="text-lg font-semibold">Értesítések</h3>
        <form action={saveNotifications} className="mt-4 grid gap-3 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="emailNewMessage" defaultChecked={notification?.emailNewMessage ?? true} />
            Email új üzenet esetén
          </label>
          <Button type="submit" variant="outline">Mentés</Button>
        </form>
      </Card>
    </div>
  );
}
