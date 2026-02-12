import { z } from "zod";

export const registerCoachSchema = z.object({
  name: z.string().min(2, "Add meg a neved."),
  email: z.string().email("Érvényes email cím kell."),
  password: z.string().min(6, "Legalább 6 karakteres jelszó kell.")
});

export const loginSchema = z.object({
  email: z.string().email("Érvényes email cím kell."),
  password: z.string().min(1, "Add meg a jelszót.")
});

export const inviteSchema = z.object({
  email: z.string().email("Érvényes email cím kell."),
  name: z.string().optional()
});

export const acceptInviteSchema = z.object({
  name: z.string().min(2, "Add meg a neved."),
  email: z.string().email("Érvényes email cím kell."),
  password: z.string().min(6, "Legalább 6 karakteres jelszó kell.")
});

export const programTemplateSchema = z.object({
  name: z.string().min(2, "Adj nevet a programnak."),
  description: z.string().optional()
});

export const programDaySchema = z.object({
  dayName: z.string().min(2, "Adj meg egy napot."),
  order: z.coerce.number().min(1)
});

export const programExerciseSchema = z.object({
  name: z.string().min(2, "Add meg a gyakorlat nevét."),
  notes: z.string().optional(),
  targetSets: z.coerce.number().optional(),
  targetReps: z.string().optional(),
  restSec: z.coerce.number().optional(),
  targetRpe: z.coerce.number().optional()
});

export const workoutSetSchema = z.object({
  exerciseName: z.string().min(2),
  setIndex: z.coerce.number().min(1),
  weight: z.coerce.number().min(0),
  reps: z.coerce.number().min(1),
  rpe: z.coerce.number().optional(),
  isPr: z.coerce.boolean().optional()
});

export const nutritionGoalSchema = z.object({
  kcal: z.coerce.number().min(0),
  proteinG: z.coerce.number().min(0),
  carbsG: z.coerce.number().min(0),
  fatG: z.coerce.number().min(0)
});

export const nutritionLogSchema = z.object({
  date: z.string(),
  kcal: z.coerce.number().min(0),
  proteinG: z.coerce.number().min(0),
  carbsG: z.coerce.number().min(0),
  fatG: z.coerce.number().min(0),
  note: z.string().optional()
});

export const weightLogSchema = z.object({
  date: z.string(),
  kg: z.coerce.number().min(0)
});

export const checkInSchema = z.object({
  weekKey: z.string(),
  weight: z.coerce.number().optional(),
  stepsAvg: z.coerce.number().min(0),
  sleepQuality: z.coerce.number().min(1).max(5),
  stress: z.coerce.number().min(1).max(5),
  energy: z.coerce.number().min(1).max(5),
  hunger: z.coerce.number().min(1).max(5),
  adherence: z.coerce.number().min(1).max(5),
  note: z.string().optional()
});

export const coachCheckInSchema = z.object({
  coachComment: z.string().optional(),
  nextWeekFocus: z.string().optional()
});

export const offlinePackageSchema = z.object({
  clientName: z.string().min(2, "Adj meg egy nevet."),
  type: z.string().min(2, "Adj meg egy típust."),
  price: z.coerce.number().min(0),
  totalSessions: z.coerce.number().min(1),
  sessionsLeft: z.coerce.number().min(0),
  expiryDate: z.string().optional()
});

export const offlineSessionSchema = z.object({
  date: z.string(),
  status: z.enum(["HELD", "CANCELLED", "NO_SHOW"]),
  note: z.string().optional()
});

export const offlinePaymentSchema = z.object({
  date: z.string(),
  amount: z.coerce.number().min(0),
  note: z.string().optional()
});

export const messageSchema = z.object({
  content: z.string().min(1, "Írj üzenetet.")
});
