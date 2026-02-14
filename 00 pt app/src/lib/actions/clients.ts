"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireClient, requireTrainer } from "@/lib/auth";

export type ClientActionState = {
  error?: string;
  success?: string;
};

const nameSchema = z.string().min(2, "Add meg a teljes nevet.");
const emailSchema = z.string().email("Adj meg ervenyes email cimet.");
const statusSchema = z.enum(["ACTIVE", "EXPIRED"]);

const optionalInt = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    if (!trimmed) return null;
    const num = Number(trimmed);
    return Number.isFinite(num) ? num : Number.NaN;
  },
  z.number().int().nonnegative().nullable()
);

const goalsSchema = z.object({
  kcalGoal: optionalInt,
  proteinG: optionalInt,
  carbsG: optionalInt,
  fatG: optionalInt
});

function normalizeNotes(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  const result = z
    .string()
    .max(2000, "A jegyzet tul hosszu.")
    .safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Hibas jegyzet." };
  }
  return { value: raw.length === 0 ? null : raw };
}

export async function createOfflineClientAction(
  _prevState: ClientActionState,
  formData: FormData
): Promise<ClientActionState> {
  const fullNameRaw = String(formData.get("fullName") ?? "").trim();
  const emailRaw = String(formData.get("email") ?? "").trim().toLowerCase();

  const nameResult = nameSchema.safeParse(fullNameRaw);
  if (!nameResult.success) {
    return { error: nameResult.error.issues[0]?.message || "Hibas nev." };
  }

  if (emailRaw) {
    const emailResult = emailSchema.safeParse(emailRaw);
    if (!emailResult.success) {
      return { error: emailResult.error.issues[0]?.message || "Hibas email." };
    }
  }

  const { trainer } = await requireTrainer();

  try {
    await db.client.create({
      data: {
        trainerId: trainer.id,
        type: "OFFLINE",
        status: "ACTIVE",
        fullName: nameResult.data,
        email: emailRaw || null
      }
    });
  } catch {
    return { error: "Technikai hiba tortent. Probald ujra." };
  }

  revalidatePath("/app/trainer/clients");
  return { success: "Offline kliens letrehozva." };
}

export async function updateClientGoalsAction(
  _prevState: ClientActionState,
  formData: FormData
): Promise<ClientActionState> {
  const clientId = String(formData.get("clientId") ?? "").trim();
  if (!clientId) return { error: "Hianyzik a kliens azonosito." };

  const goalsResult = goalsSchema.safeParse({
    kcalGoal: formData.get("kcalGoal"),
    proteinG: formData.get("proteinG"),
    carbsG: formData.get("carbsG"),
    fatG: formData.get("fatG")
  });
  if (!goalsResult.success) {
    return { error: "Hibas cel adatok." };
  }

  const { trainer } = await requireTrainer();

  let updated;
  try {
    updated = await db.client.updateMany({
      where: { id: clientId, trainerId: trainer.id },
      data: goalsResult.data
    });
  } catch {
    return { error: "Technikai hiba tortent. Probald ujra." };
  }

  if (!updated || updated.count === 0) {
    return { error: "Kliens nem talalhato." };
  }

  revalidatePath("/app/trainer/clients");
  revalidatePath(`/app/trainer/clients/${clientId}`);
  revalidatePath(`/app/trainer/offline-clients/${clientId}`);
  return { success: "Celok mentve." };
}

export async function updateClientStatusAction(
  _prevState: ClientActionState,
  formData: FormData
): Promise<ClientActionState> {
  const clientId = String(formData.get("clientId") ?? "").trim();
  const statusRaw = String(formData.get("status") ?? "").trim();
  if (!clientId) return { error: "Hianyzik a kliens azonosito." };

  const statusResult = statusSchema.safeParse(statusRaw);
  if (!statusResult.success) {
    return { error: "Hibas statusz." };
  }

  const { trainer } = await requireTrainer();

  let updated;
  try {
    updated = await db.client.updateMany({
      where: { id: clientId, trainerId: trainer.id },
      data: { status: statusResult.data }
    });
  } catch {
    return { error: "Technikai hiba tortent. Probald ujra." };
  }

  if (!updated || updated.count === 0) {
    return { error: "Kliens nem talalhato." };
  }

  revalidatePath("/app/trainer/clients");
  revalidatePath(`/app/trainer/clients/${clientId}`);
  revalidatePath(`/app/trainer/offline-clients/${clientId}`);
  revalidatePath("/app/client/home");
  return { success: "Statusz mentve." };
}

export async function updateClientNotesByTrainerAction(
  _prevState: ClientActionState,
  formData: FormData
): Promise<ClientActionState> {
  const clientId = String(formData.get("clientId") ?? "").trim();
  if (!clientId) return { error: "Hianyzik a kliens azonosito." };

  const notesResult = normalizeNotes(formData.get("sharedNotes"));
  if ("error" in notesResult) {
    return { error: notesResult.error };
  }

  const { trainer } = await requireTrainer();

  let updated;
  try {
    updated = await db.client.updateMany({
      where: { id: clientId, trainerId: trainer.id },
      data: { sharedNotes: notesResult.value }
    });
  } catch {
    return { error: "Technikai hiba tortent. Probald ujra." };
  }

  if (!updated || updated.count === 0) {
    return { error: "Kliens nem talalhato." };
  }

  revalidatePath(`/app/trainer/clients/${clientId}`);
  revalidatePath(`/app/trainer/offline-clients/${clientId}`);
  revalidatePath("/app/client/home");
  return { success: "Jegyzet mentve." };
}

export async function updateClientNotesByClientAction(
  _prevState: ClientActionState,
  formData: FormData
): Promise<ClientActionState> {
  const notesResult = normalizeNotes(formData.get("sharedNotes"));
  if ("error" in notesResult) {
    return { error: notesResult.error };
  }

  const { client } = await requireClient();

  let updated;
  try {
    updated = await db.client.updateMany({
      where: { id: client.id, trainerId: client.trainerId },
      data: { sharedNotes: notesResult.value }
    });
  } catch {
    return { error: "Technikai hiba tortent. Probald ujra." };
  }

  if (!updated || updated.count === 0) {
    return { error: "Kliens nem talalhato." };
  }

  revalidatePath("/app/client/home");
  revalidatePath(`/app/trainer/clients/${client.id}`);
  return { success: "Jegyzet mentve." };
}
