import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const uploadDir = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");
  const safePath = params.path.join("/");

  if (safePath.includes("..")) {
    return NextResponse.json({ error: "Érvénytelen útvonal." }, { status: 400 });
  }

  const filePath = path.join(uploadDir, safePath);

  try {
    const file = await readFile(filePath);
    return new NextResponse(file);
  } catch (error) {
    return NextResponse.json({ error: "Fájl nem található." }, { status: 404 });
  }
}
