import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const MAX_FILE_SIZE = 4 * 1024 * 1024;
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];

export type UploadResult = {
  filePath: string;
};

function getUploadsDir() {
  return process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");
}

export async function saveUpload(file: File): Promise<UploadResult> {
  if (!ALLOWED_MIME.includes(file.type)) {
    throw new Error("Csak JPEG, PNG vagy WEBP engedélyezett.");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Max 4MB fájl tölthető fel.");
  }

  const driver = process.env.UPLOAD_DRIVER ?? "local";
  const filename = `${randomUUID()}.${file.type.split("/")[1]}`;

  if (driver === "s3") {
    const bucket = process.env.S3_BUCKET;
    const region = process.env.S3_REGION ?? "eu-central-1";
    const endpoint = process.env.S3_ENDPOINT;
    const publicUrl = process.env.S3_PUBLIC_URL;

    if (!bucket) {
      throw new Error("S3_BUCKET nincs beállítva.");
    }

    const client = new S3Client({
      region,
      endpoint,
      forcePathStyle: Boolean(endpoint)
    });

    const arrayBuffer = await file.arrayBuffer();
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: filename,
        Body: Buffer.from(arrayBuffer),
        ContentType: file.type
      })
    );

    return { filePath: publicUrl ? `${publicUrl}/${filename}` : `s3://${bucket}/${filename}` };
  }

  const uploadsDir = getUploadsDir();
  await mkdir(uploadsDir, { recursive: true });

  const arrayBuffer = await file.arrayBuffer();
  const filePath = path.join(uploadsDir, filename);
  await writeFile(filePath, Buffer.from(arrayBuffer));

  return { filePath: `/uploads/${filename}` };
}
