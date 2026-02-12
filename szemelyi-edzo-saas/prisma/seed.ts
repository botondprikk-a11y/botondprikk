import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/hash";

const prisma = new PrismaClient();

async function main() {
  const coachEmail = "coach@demo.hu";
  const clientEmail = "client@demo.hu";

  await prisma.user.deleteMany();

  const coach = await prisma.user.create({
    data: {
      name: "Demo Edző",
      email: coachEmail,
      role: "COACH",
      passwordHash: await hashPassword("password123")
    }
  });

  const client = await prisma.user.create({
    data: {
      name: "Demo Vendég",
      email: clientEmail,
      role: "CLIENT",
      passwordHash: await hashPassword("password123")
    }
  });

  await prisma.coachClient.create({
    data: {
      coachId: coach.id,
      clientId: client.id,
      status: "ACTIVE"
    }
  });

  const template = await prisma.programTemplate.create({
    data: {
      coachId: coach.id,
      name: "Erő + tónus",
      description: "Heti három napos teljes test program",
      days: {
        create: [
          {
            dayName: "Hétfő",
            order: 1,
            exercises: {
              create: [
                {
                  name: "Guggolás",
                  targetSets: 4,
                  targetReps: "8-10",
                  restSec: 90,
                  targetRpe: 7
                },
                {
                  name: "Fekvenyomás",
                  targetSets: 3,
                  targetReps: "8-12",
                  restSec: 90,
                  targetRpe: 7
                }
              ]
            }
          },
          {
            dayName: "Szerda",
            order: 2,
            exercises: {
              create: [
                {
                  name: "Kitörés",
                  targetSets: 3,
                  targetReps: "10-12",
                  restSec: 60
                }
              ]
            }
          }
        ]
      }
    }
  });

  await prisma.clientProgram.create({
    data: {
      clientId: client.id,
      templateId: template.id
    }
  });

  await prisma.nutritionGoal.create({
    data: {
      clientId: client.id,
      kcal: 2200,
      proteinG: 140,
      carbsG: 230,
      fatG: 60
    }
  });

  await prisma.nutritionLog.create({
    data: {
      clientId: client.id,
      date: new Date(),
      kcal: 2100,
      proteinG: 135,
      carbsG: 220,
      fatG: 55,
      note: "Jó nap, sok víz."
    }
  });

  await prisma.weightLog.create({
    data: {
      clientId: client.id,
      date: new Date(),
      kg: 78.5
    }
  });

  await prisma.checkIn.create({
    data: {
      clientId: client.id,
      weekKey: "2024-W30",
      stepsAvg: 9000,
      sleepQuality: 4,
      stress: 2,
      energy: 4,
      hunger: 3,
      adherence: 4,
      note: "Jól ment a hét."
    }
  });

  await prisma.offlinePackage.create({
    data: {
      coachId: coach.id,
      clientName: "Kovács Bence",
      type: "10 alkalmas",
      price: 80000,
      totalSessions: 10,
      sessionsLeft: 6
    }
  });

  await prisma.notificationPreference.create({
    data: {
      userId: coach.id,
      emailNewCheckin: true,
      emailNewMessage: true
    }
  });

  await prisma.notificationPreference.create({
    data: {
      userId: client.id,
      emailNewCheckin: true,
      emailNewMessage: true
    }
  });

  console.log("Seed kész.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
