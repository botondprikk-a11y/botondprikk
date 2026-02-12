import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/hash";
import { registerCoachSchema } from "@/lib/validators";
import { createSession } from "@/lib/auth";
import { PublicNav } from "@/components/layout/PublicNav";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterCoachPage({ searchParams }: { searchParams: { error?: string } }) {
  async function register(formData: FormData) {
    "use server";
    const parsed = registerCoachSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password")
    });

    if (!parsed.success) {
      redirect(`/register-coach?error=${encodeURIComponent(parsed.error.errors[0].message)}`);
    }

    const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
    if (existing) {
      redirect("/register-coach?error=Ez%20az%20email%20m%C3%A1r%20foglalt.");
    }

    const user = await db.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash: await hashPassword(parsed.data.password),
        role: "COACH",
        notificationPreference: {
          create: {
            emailNewCheckin: true,
            emailNewMessage: true
          }
        }
      }
    });

    await createSession(user.id);
    redirect("/app/coach/dashboard");
  }

  return (
    <div>
      <PublicNav />
      <main className="mx-auto w-[92%] max-w-md py-12">
        <Card>
          <h1 className="text-2xl font-display">Edző regisztráció</h1>
          {searchParams.error ? (
            <p className="mt-2 text-sm text-rose-600">{searchParams.error}</p>
          ) : null}
          <form action={register} className="mt-6 grid gap-4">
            <label className="text-sm font-semibold">
              Név
              <Input name="name" placeholder="Teljes név" />
            </label>
            <label className="text-sm font-semibold">
              Email
              <Input name="email" type="email" placeholder="email@pelda.hu" />
            </label>
            <label className="text-sm font-semibold">
              Jelszó
              <Input name="password" type="password" placeholder="Legalább 6 karakter" />
            </label>
            <Button type="submit">Fiók létrehozása</Button>
          </form>
        </Card>
      </main>
    </div>
  );
}
