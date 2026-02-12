import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";

const SESSION_COOKIE = "edzo_session";
const SESSION_TTL_DAYS = 30;

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_TTL_DAYS);

  await db.session.create({
    data: {
      token,
      userId,
      expiresAt
    }
  });

  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt
  });
}

export async function clearSession() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (token) {
    await db.session.deleteMany({ where: { token } });
  }
  cookies().delete(SESSION_COOKIE);
}

export async function getUserFromRequest() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await db.session.findFirst({
    where: {
      token,
      expiresAt: { gt: new Date() }
    },
    include: { user: true }
  });

  if (!session) return null;
  return session.user;
}

export async function requireUser() {
  const user = await getUserFromRequest();
  if (!user) redirect("/login");
  return user;
}

export async function requireCoach() {
  const user = await requireUser();
  if (user.role !== "COACH") redirect("/app/client/today");
  return user;
}

export async function requireClient() {
  const user = await requireUser();
  if (user.role !== "CLIENT") redirect("/app/coach/dashboard");
  return user;
}

export function getSessionCookieName() {
  return SESSION_COOKIE;
}
