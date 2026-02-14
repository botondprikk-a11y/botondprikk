import { SignJWT, jwtVerify } from "jose";

export type SessionRole = "TRAINER" | "CLIENT" | "ADMIN";

export const SESSION_COOKIE = "ptapp_session";
export const SESSION_TTL_DAYS = 30;

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is required");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: {
  userId: string;
  role: SessionRole;
}) {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_DAYS}d`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const role = payload.role;
    const userId = payload.sub;
    if (!role || !userId) return null;
    return { userId, role: role as SessionRole };
  } catch {
    return null;
  }
}
