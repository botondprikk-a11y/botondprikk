import { NextResponse } from "next/server";
import { saveUpload } from "@/lib/upload";
import { getWeekKey } from "@/lib/date";
import { getUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const user = await getUserFromRequest();
  if (!user || user.role !== "CLIENT") {
    return NextResponse.json({ error: "Nincs jogosultság." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Nincs fájl." }, { status: 400 });
  }

  try {
    const weekKey = getWeekKey();
    const weeklyCount = await db.progressPhoto.count({
      where: { clientId: user.id, weekKey }
    });

    if (weeklyCount >= 3) {
      return NextResponse.json({ error: "Hetente maximum 3 kép tölthető fel." }, { status: 400 });
    }

    const result = await saveUpload(file);

    const photo = await db.progressPhoto.create({
      data: {
        clientId: user.id,
        filePath: result.filePath,
        weekKey
      }
    });

    return NextResponse.json({ success: true, photo });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
