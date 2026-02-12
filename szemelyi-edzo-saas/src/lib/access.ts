import { db } from "@/lib/db";

export async function ensureCoachClientAccess(coachId: string, clientId: string) {
  const relation = await db.coachClient.findFirst({
    where: {
      coachId,
      clientId
    }
  });

  if (!relation) {
    throw new Error("Nincs jogosultság ehhez a vendéghez.");
  }

  return relation;
}
