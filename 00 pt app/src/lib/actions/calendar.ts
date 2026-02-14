"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireTrainer } from "@/lib/auth";
import { sendEmail } from "@/lib/mailer";
import { syncCalendarEvent } from "@/lib/google";

export type CalendarActionState = {
  error?: string;
  success?: string;
};

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Hibas datum.");
const timeSchema = z.string().regex(/^\d{2}:\d{2}$/, "Hibas ido.");
const durationSchema = z
  .number()
  .int()
  .min(15, "A hossz minimum 15 perc.")
  .max(480, "A hossz maximum 480 perc.");

const booleanSchema = z.preprocess((value) => value === "on", z.boolean());

function parseDateTime(date: string, time: string) {
  const value = new Date(`${date}T${time}:00`);
  if (Number.isNaN(value.getTime())) return null;
  return value;
}

export async function createCalendarEventAction(
  _prevState: CalendarActionState,
  formData: FormData
): Promise<CalendarActionState> {
  const clientId = String(formData.get("clientId") ?? "").trim();
  const titleRaw = String(formData.get("title") ?? "").trim();
  const dateRaw = String(formData.get("date") ?? "").trim();
  const timeRaw = String(formData.get("time") ?? "").trim();
  const durationRaw = Number(formData.get("durationMinutes"));

  if (!clientId) return { error: "Valassz klienst." };

  const titleResult = z
    .string()
    .min(2, "Adj meg egy cimet.")
    .max(120, "Tul hosszu cim.")
    .safeParse(titleRaw);
  if (!titleResult.success) {
    return { error: titleResult.error.issues[0]?.message || "Hibas cim." };
  }

  const dateResult = dateSchema.safeParse(dateRaw);
  const timeResult = timeSchema.safeParse(timeRaw);
  const durationResult = durationSchema.safeParse(durationRaw);
  if (!dateResult.success || !timeResult.success || !durationResult.success) {
    return { error: "Hibas datum vagy ido." };
  }

  const startsAt = parseDateTime(dateResult.data, timeResult.data);
  if (!startsAt) return { error: "Hibas datum vagy ido." };
  const endsAt = new Date(startsAt.getTime() + durationResult.data * 60_000);

  const workoutReminder = booleanSchema.parse(
    formData.get("workoutReminder")
  );
  const paymentReminder = booleanSchema.parse(
    formData.get("paymentReminder")
  );

  const { trainer } = await requireTrainer();

  const client = await db.client.findFirst({
    where: { id: clientId, trainerId: trainer.id }
  });
  if (!client) {
    return { error: "Kliens nem talalhato." };
  }

  if ((workoutReminder || paymentReminder) && !client.email) {
    return { error: "Email kuldeshez meg kell adni a kliens email cimet." };
  }

  let event;
  try {
    event = await db.calendarEvent.create({
      data: {
        trainerId: trainer.id,
        clientId: client.id,
        title: titleResult.data,
        startsAt,
        endsAt,
        paymentDue: paymentReminder,
        workoutReminderStatus: workoutReminder ? "PENDING" : null,
        paymentReminderStatus: paymentReminder ? "PENDING" : null,
        googleSyncStatus: "PENDING"
      }
    });
  } catch {
    return { error: "Technikai hiba tortent. Probald ujra." };
  }

  let workoutStatus = event.workoutReminderStatus;
  let paymentStatus = event.paymentReminderStatus;

  if (workoutReminder && client.email) {
    const mail = await sendEmail({
      to: client.email,
      subject: "Holnap edzes",
      text: `Szia ${client.fullName}, holnap edzes: ${titleResult.data}.`
    });
    workoutStatus = mail.ok ? "SENT" : "FAILED";
  }

  if (paymentReminder && client.email) {
    const mail = await sendEmail({
      to: client.email,
      subject: "Fizetes esedekes",
      text: `Szia ${client.fullName}, fizetes esedekes: ${titleResult.data}.`
    });
    paymentStatus = mail.ok ? "SENT" : "FAILED";
  }

  let syncResult: Awaited<ReturnType<typeof syncCalendarEvent>>;
  try {
    syncResult = await syncCalendarEvent(event.id, trainer.id);
  } catch {
    syncResult = { status: "FAILED", error: "Google sync hiba." };
  }

  try {
    await db.calendarEvent.update({
      where: { id: event.id },
      data: {
        workoutReminderStatus: workoutStatus,
        paymentReminderStatus: paymentStatus,
        googleSyncStatus: syncResult.status,
        googleSyncError: "error" in syncResult ? syncResult.error : null,
        googleEventId:
          "googleEventId" in syncResult ? syncResult.googleEventId : null,
        lastSyncedAt: "googleEventId" in syncResult ? new Date() : null
      }
    });
  } catch {
    return { error: "Esemeny mentese sikertelen." };
  }

  revalidatePath("/app/trainer/calendar");
  return { success: "Esemeny letrehozva." };
}

export async function markCalendarEventDoneAction(
  _prevState: CalendarActionState,
  formData: FormData
): Promise<CalendarActionState> {
  const eventId = String(formData.get("eventId") ?? "").trim();
  if (!eventId) return { error: "Hianyzik az esemeny azonosito." };

  const { trainer } = await requireTrainer();

  let updated;
  try {
    updated = await db.calendarEvent.updateMany({
      where: { id: eventId, trainerId: trainer.id },
      data: { status: "DONE" }
    });
  } catch {
    return { error: "Technikai hiba tortent. Probald ujra." };
  }

  if (!updated || updated.count === 0) {
    return { error: "Esemeny nem talalhato." };
  }

  revalidatePath("/app/trainer/calendar");
  return { success: "Esemeny lezarva." };
}

export async function connectGoogleAction(
  _prevState: CalendarActionState,
  formData: FormData
): Promise<CalendarActionState> {
  const emailRaw = String(formData.get("email") ?? "").trim();
  const accessTokenRaw = String(formData.get("accessToken") ?? "").trim();
  const refreshTokenRaw = String(formData.get("refreshToken") ?? "").trim();
  const calendarIdRaw = String(formData.get("calendarId") ?? "").trim();

  if (!accessTokenRaw || !refreshTokenRaw) {
    return { error: "Google tokenek kotelezoek." };
  }

  const { trainer } = await requireTrainer();

  try {
    await db.trainerGoogleAccount.upsert({
      where: { trainerId: trainer.id },
      create: {
        trainerId: trainer.id,
        email: emailRaw || null,
        accessToken: accessTokenRaw,
        refreshToken: refreshTokenRaw,
        calendarId: calendarIdRaw || null
      },
      update: {
        email: emailRaw || null,
        accessToken: accessTokenRaw,
        refreshToken: refreshTokenRaw,
        calendarId: calendarIdRaw || null
      }
    });
  } catch {
    return { error: "Technikai hiba tortent. Probald ujra." };
  }

  revalidatePath("/app/trainer/calendar");
  return { success: "Google naptar osszekotve." };
}
