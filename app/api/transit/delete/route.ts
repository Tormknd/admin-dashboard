import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getFiles, FileRecord } from '@/lib/file-store';

const DB_PATH = path.join(process.cwd(), 'data', 'files-db.json');

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const filename = searchParams.get('filename');

  if (!filename) return NextResponse.json({ error: 'No filename' }, { status: 400 });

  const safeFilename = path.basename(filename);
  const filePath = path.join(process.cwd(), 'data', 'uploads', safeFilename);

  try {
    await fs.unlink(filePath);

    const files = await getFiles();
    const newFiles = files.filter((f: FileRecord) => f.filename !== safeFilename);
    await fs.writeFile(DB_PATH, JSON.stringify(newFiles, null, 2));

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

