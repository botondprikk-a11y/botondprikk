import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  SESSION_COOKIE,
  SESSION_TTL_DAYS,
  createSessionToken,
  verifySessionToken,
  type SessionRole
} from "@/lib/session";

function roleHome(role: SessionRole) {
  if (role === "TRAINER") return "/app/trainer/dashboard";
  if (role === "CLIENT") return "/app/client/home";
  return "/app/admin";
}

export async function createSession(user: { id: string; role: SessionRole }) {
  const token = await createSessionToken({
    userId: user.id,
    role: user.role
  });

  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * SESSION_TTL_DAYS,
    secure: process.env.NODE_ENV === "production"
  });
}

export async function clearSession() {
  cookies().delete(SESSION_COOKIE);
}

export async function getSession() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireTrainer() {
  const session = await requireUser();
  if (session.role !== "TRAINER") redirect(roleHome(session.role));

  const trainer = await db.trainer.findUnique({
    where: { userId: session.userId }
  });
  if (!trainer) redirect("/login");

  return { session, trainer };
}

export async function requireClient() {
  const session = await requireUser();
  if (session.role !== "CLIENT") redirect(roleHome(session.role));

  const client = await db.client.findUnique({
    where: { userId: session.userId }
  });
  if (!client) redirect("/login");

  return { session, client };
}

export async function requireAdmin() {
  const session = await requireUser();
  if (session.role !== "ADMIN") redirect(roleHome(session.role));
  return session;
}
