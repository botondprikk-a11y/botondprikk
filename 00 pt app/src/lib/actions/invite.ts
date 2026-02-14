"use server";

import { z } from "zod";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import type { Invitation } from "@prisma/client";
import { requireTrainer } from "@/lib/auth";

export type InviteState = {
  error?: string;
  invitePath?: string;
};

const emailSchema = z.string().email("Adj meg ervenyes email cimet.");

export async function createInviteAction(
  _prevState: InviteState,
  formData: FormData
): Promise<InviteState> {
  const emailRaw = String(formData.get("email") || "").trim().toLowerCase();

  const emailResult = emailSchema.safeParse(emailRaw);
  if (!emailResult.success) {
    return { error: emailResult.error.issues[0]?.message || "Hibas email." };
  }

  const { trainer } = await requireTrainer();

  let existing: Invitation | null = null;
  try {
    existing = await db.invitation.findFirst({
      where: {
        trainerId: trainer.id,
        email: emailResult.data,
        status: "PENDING",
        expiresAt: { gt: new Date() }
      }
    });
  } catch {
    return { error: "Technikai hiba tortent. Probald ujra." };
  }
  if (existing) {
    return { error: "Mar van aktiv meghivo ehhez az emailhez." };
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  try {
    await db.invitation.create({
      data: {
        trainerId: trainer.id,
        email: emailResult.data,
        token,
        status: "PENDING",
        expiresAt
      }
    });
  } catch {
    return { error: "Technikai hiba tortent. Probald ujra." };
  }

  return { invitePath: `/register?invite=${token}` };
}
