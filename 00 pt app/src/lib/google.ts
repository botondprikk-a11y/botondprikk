import { db } from "@/lib/db";

export async function syncCalendarEvent(eventId: string, trainerId: string) {
  const account = await db.trainerGoogleAccount.findUnique({
    where: { trainerId }
  });

  if (!account) {
    return {
      status: "FAILED" as const,
      error: "Google nincs osszekotve."
    };
  }

  if (!account.accessToken || !account.refreshToken) {
    return {
      status: "FAILED" as const,
      error: "Google token hianyzik."
    };
  }

  // TODO: implement actual Google Calendar API sync.
  return {
    status: "SYNCED" as const,
    googleEventId: `stub-${eventId}`
  };
}
