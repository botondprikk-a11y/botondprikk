import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/hash";
import { loginSchema } from "@/lib/validators";
import { createSession } from "@/lib/auth";
import { PublicNav } from "@/components/layout/PublicNav";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  async function login(formData: FormData) {
    "use server";
    const parsed = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password")
    });

    if (!parsed.success) {
      redirect(`/login?error=${encodeURIComponent(parsed.error.errors[0].message)}`);
    }

    const user = await db.user.findUnique({ where: { email: parsed.data.email } });
    if (!user) {
      redirect("/login?error=Hib%C3%A1s%20bel%C3%A9p%C3%A9s.");
    }

    const ok = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!ok) {
      redirect("/login?error=Hib%C3%A1s%20bel%C3%A9p%C3%A9s.");
    }

    await createSession(user.id);
    redirect(user.role === "COACH" ? "/app/coach/dashboard" : "/app/client/today");
  }

  return (
    <div>
      <PublicNav />
      <main className="mx-auto w-[92%] max-w-md py-12">
        <Card>
          <h1 className="text-2xl font-display">Belépés</h1>
          {searchParams.error ? (
            <p className="mt-2 text-sm text-rose-600">{searchParams.error}</p>
          ) : null}
          <form action={login} className="mt-6 grid gap-4">
            <label className="text-sm font-semibold">
              Email
              <Input name="email" type="email" placeholder="email@pelda.hu" />
            </label>
            <label className="text-sm font-semibold">
              Jelszó
              <Input name="password" type="password" placeholder="Jelszó" />
            </label>
            <Button type="submit">Belépés</Button>
          </form>
        </Card>
      </main>
    </div>
  );
}
