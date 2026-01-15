import { NextResponse } from 'next/server';
import { checkDiskSpace } from '@/lib/disk-guard';
import { addFile, FileRecord } from '@/lib/file-store';
import { writeFile } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export async function POST(req: Request) {
  const { safe, freeGb } = await checkDiskSpace();
  if (!safe) {
    return NextResponse.json(
      { error: `Espace disque insuffisant (Libre: ${freeGb}GB, Requis: >5GB)` },
      { status: 507 }
    );
  }

  const formData = await req.formData();
  const file = formData.get('file') as File;
  const isPersistent = formData.get('isPersistent') === 'true';

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const fileId = crypto.randomUUID();
  const extension = path.extname(file.name);
  const safeFilename = `${fileId}${extension}`;
  const savePath = path.join(process.cwd(), 'data', 'uploads', safeFilename);

  await writeFile(savePath, buffer);

  const record: FileRecord = {
    id: fileId,
    originalName: file.name,
    filename: safeFilename,
    size: file.size,
    uploadedAt: Date.now(),
    isPersistent
  };

  await addFile(record);

  return NextResponse.json({ success: true, file: record });
}

