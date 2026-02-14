"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { Role, type Invitation, type User } from "@prisma/client";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";

export type AuthState = {
  error?: string;
};

const emailSchema = z.string().email("Adj meg ervenyes email cimet.");
const passwordSchema = z
  .string()
  .min(8, "A jelszo legalabb 8 karakter legyen.");

function roleHome(role: Role) {
  if (role === "TRAINER") return "/app/trainer/dashboard";
  if (role === "CLIENT") return "/app/client/home";
  return "/app/admin";
}

export async function loginAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const emailRaw = String(formData.get("email") || "").trim().toLowerCase();
  const passwordRaw = String(formData.get("password") || "");

  const emailResult = emailSchema.safeParse(emailRaw);
  const passResult = passwordSchema.safeParse(passwordRaw);
  if (!emailResult.success || !passResult.success) {
    return { error: "Hibas email vagy jelszo." };
  }

  let user: User | null = null;
  try {
    user = await db.user.findUnique({
      where: { email: emailResult.data }
    });
  } catch {
    return { error: "Technikai hiba tortent. Probald ujra." };
  }
  if (!user) {
    return { error: "Hibas email vagy jelszo." };
  }

  const isValid = await bcrypt.compare(passwordRaw, user.passwordHash);
  if (!isValid) {
    return { error: "Hibas email vagy jelszo." };
  }

  await createSession(user);
  redirect(roleHome(user.role));
}

export async function registerTrainerAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const emailRaw = String(formData.get("email") || "").trim().toLowerCase();
  const passwordRaw = String(formData.get("password") || "");

  const emailResult = emailSchema.safeParse(emailRaw);
  const passResult = passwordSchema.safeParse(passwordRaw);
  if (!emailResult.success || !passResult.success) {
    return { error: "Ellenorizd az emailt es a jelszot." };
  }

  let existing: User | null = null;
  try {
    existing = await db.user.findUnique({
      where: { email: emailResult.data }
    });
  } catch {
    return { error: "Technikai hiba tortent. Probald ujra." };
  }
  if (existing) {
    return { error: "Ez az email mar foglalt." };
  }

  const passwordHash = await bcrypt.hash(passwordRaw, 10);

  let result: { user: User } | null = null;
  try {
    result = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: emailResult.data,
          passwordHash,
          role: "TRAINER"
        }
      });

      await tx.trainer.create({
        data: {
          userId: user.id
        }
      });

      return { user };
    });
  } catch {
    return { error: "Technikai hiba tortent. Probald ujra." };
  }

  if (!result) {
    return { error: "Technikai hiba tortent. Probald ujra." };
  }

  await createSession(result.user);
  redirect("/app/trainer/dashboard");
}

export async function registerClientAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const inviteToken = String(formData.get("inviteToken") || "").trim();
  const emailRaw = String(formData.get("email") || "").trim().toLowerCase();
  const fullNameRaw = String(formData.get("fullName") || "").trim();
  const passwordRaw = String(formData.get("password") || "");

  const emailResult = emailSchema.safeParse(emailRaw);
  const passResult = passwordSchema.safeParse(passwordRaw);
  const nameResult = z
    .string()
    .min(2, "Add meg a teljes neved.")
    .safeParse(fullNameRaw);

  if (!inviteToken) {
    return { error: "Hianyzik a meghivo token." };
  }

  if (!emailResult.success || !passResult.success || !nameResult.success) {
    return { error: "Ellenorizd az adatokat." };
  }

  let invitation: Invitation | null = null;
  try {
    invitation = await db.invitation.findUnique({
      where: { token: inviteToken }
    });
  } catch {
    return { error: "Technikai hiba tortent. Probald ujra." };
  }
  if (
    !invitation ||
    invitation.status !== "PENDING" ||
    invitation.expiresAt < new Date()
  ) {
    return { error: "A meghivo ervenytelen vagy lejart." };
  }

  if (invitation.email.toLowerCase() !== emailResult.data) {
    return { error: "Az email nem egyezik a meghivoval." };
  }

  let existing: User | null = null;
  try {
    existing = await db.user.findUnique({
      where: { email: emailResult.data }
    });
  } catch {
    return { error: "Technikai hiba tortent. Probald ujra." };
  }
  if (existing) {
    return { error: "Ez az email mar foglalt." };
  }

  const passwordHash = await bcrypt.hash(passwordRaw, 10);

  let result: { user: User } | null = null;
  try {
    result = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: emailResult.data,
          passwordHash,
          role: "CLIENT"
        }
      });

      await tx.client.create({
        data: {
          trainerId: invitation.trainerId,
          userId: user.id,
          type: "ONLINE",
          status: "ACTIVE",
          fullName: nameResult.data,
          email: emailResult.data
        }
      });

      await tx.invitation.update({
        where: { id: invitation.id },
        data: {
          status: "ACCEPTED",
          acceptedAt: new Date()
        }
      });

      return { user };
    });
  } catch {
    return { error: "Technikai hiba tortent. Probald ujra." };
  }

  if (!result) {
    return { error: "Technikai hiba tortent. Probald ujra." };
  }

  await createSession(result.user);
  redirect("/app/client/home");
}
